import re

from flask import g, request
from sqlalchemy import func, or_

from app.common.api import APIError, boolean, password, success, text
from app.extensions import db
from app.models import Role, User


USER_FIELDS = {
    'identification',
    'first_name',
    'last_name',
    'email',
    'password',
    'role_id',
    'is_active',
}

PROFILE_FIELDS = {
    'identification',
    'first_name',
    'last_name',
    'email',
}


def get_user(user_id):
    user = db.session.get(User, user_id)

    if not user:
        raise APIError('Usuario no encontrado.', 404)

    return user


def _validate_email(value):
    email = value.lower()

    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        raise APIError('El correo no tiene un formato válido.')

    return email


def _ensure_unique(user_id=None, identification=None, email=None):
    if identification is not None:
        query = User.query.filter(
            User.identification == identification
        )
        if user_id:
            query = query.filter(User.id != user_id)
        if query.first():
            raise APIError('identification ya está registrado.', 409)

    if email is not None:
        query = User.query.filter(
            func.lower(User.email) == email.lower()
        )
        if user_id:
            query = query.filter(User.id != user_id)
        if query.first():
            raise APIError('email ya está registrado.', 409)


def update_own_profile(user, data):
    """Actualiza únicamente datos personales del usuario autenticado."""
    extra = set(data) - PROFILE_FIELDS

    if extra:
        raise APIError(
            'Desde el perfil solo se pueden actualizar identificación, '
            'nombre, apellido y correo.'
        )

    values = {}

    for key in PROFILE_FIELDS:
        if key in data:
            values[key] = text(data, key, 100)

    if not values:
        raise APIError('No hay campos de perfil para actualizar.')

    if 'email' in values:
        values['email'] = _validate_email(values['email'])

    _ensure_unique(
        user_id=user.id,
        identification=values.get('identification'),
        email=values.get('email'),
    )

    for key, value in values.items():
        setattr(user, key, value)

    db.session.commit()

    return success(
        'Perfil actualizado correctamente.',
        user=user.to_dict(),
    )


def save_user(data, user_id=None, public=False):
    if set(data) - USER_FIELDS:
        raise APIError('Hay campos no admitidos en el usuario.')

    user = get_user(user_id) if user_id else User()
    values = {}

    for key in ('identification', 'first_name', 'last_name', 'email'):
        if user_id is None or key in data:
            values[key] = text(data, key, 100)

    if 'email' in values:
        values['email'] = _validate_email(values['email'])

    _ensure_unique(
        user_id=user_id,
        identification=values.get('identification'),
        email=values.get('email'),
    )

    if public:
        if 'role_id' in data or 'is_active' in data:
            raise APIError(
                'El registro público asigna únicamente el rol student.'
            )

        role = Role.query.filter_by(
            name='student',
            is_active=True,
        ).first()

        if not role:
            raise APIError(
                'El rol student no está disponible. Ejecuta seed_roles.py.',
                409,
            )

        values.update(
            role_id=role.id,
            is_active=True,
        )

    elif user_id is None or 'role_id' in data:
        role_id = data.get('role_id')

        if type(role_id) is not int:
            raise APIError('role_id debe ser un entero.')

        role = db.session.get(Role, role_id)

        if not role or not role.is_active:
            raise APIError(
                'El rol seleccionado no existe o está inactivo.'
            )

        values['role_id'] = role.id

    if not public and 'is_active' in data:
        values['is_active'] = boolean(data['is_active'])

    # El administrador autenticado no puede quitarse el rol admin
    # ni desactivar su propia cuenta desde la administración.
    if user_id and user_id == g.user.id:
        role_id = values.get(
            'role_id',
            user.role_id,
        )
        selected_role = db.session.get(
            Role,
            role_id,
        )

        if (
            not values.get('is_active', user.is_active)
            or not selected_role
            or selected_role.name != 'admin'
        ):
            raise APIError(
                'No puedes desactivar tu cuenta ni quitarte el rol admin.',
                409,
            )

    secret = (
        password(data)
        if user_id is None or 'password' in data
        else None
    )

    for key, value in values.items():
        setattr(user, key, value)

    if secret is not None:
        user.set_password(secret)

    db.session.add(user)
    db.session.commit()

    return (
        success(
            'Usuario guardado correctamente.',
            user=user.to_dict(),
        ),
        200 if user_id else 201,
    )


def list_users():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        if page < 1 or not 1 <= per_page <= 100:
            raise ValueError()
    except ValueError:
        raise APIError(
            'page debe ser positivo y per_page debe estar entre 1 y 100.'
        )

    query = User.query
    search = request.args.get('search', '').strip()

    if search:
        query = query.filter(
            or_(
                *[
                    getattr(User, key).ilike(f'%{search}%')
                    for key in (
                        'identification',
                        'first_name',
                        'last_name',
                        'email',
                    )
                ]
            )
        )

    if 'role_id' in request.args:
        try:
            role_id = int(request.args['role_id'])
        except ValueError:
            raise APIError('role_id debe ser un entero.')

        query = query.filter_by(role_id=role_id)

    if 'is_active' in request.args:
        active = request.args['is_active'].lower()

        if active not in ('true', 'false'):
            raise APIError('is_active debe ser true o false.')

        query = query.filter_by(
            is_active=active == 'true'
        )

    result = query.order_by(User.id).paginate(
        page=page,
        per_page=per_page,
        error_out=False,
    )

    return success(
        'Usuarios consultados.',
        users=[
            user.to_dict()
            for user in result.items
        ],
        pagination={
            'page': page,
            'per_page': per_page,
            'total': result.total,
            'pages': result.pages,
        },
    )


def deactivate_user(user_id):
    return save_user(
        {'is_active': False},
        user_id,
    )
