from app.extensions import db
from app.models import Role, User
from app.common.api import APIError, text, boolean, success

SYSTEM_ROLES = {'admin', 'teacher', 'student', 'doctor'}

def get_role(role_id):
    role = db.session.get(Role, role_id)
    if not role:
        raise APIError('Rol no encontrado.', 404)
    return role

def list_roles():
    return success('Roles consultados.', roles=[r.to_dict() for r in Role.query.order_by(Role.id).all()])

def save_role(data, role_id=None):
    if set(data) - {'name', 'description', 'is_active'}:
        raise APIError('Hay campos no admitidos en el rol.')
    role = get_role(role_id) if role_id else Role()
    values = {}
    if not role_id or 'name' in data:
        name = text(data, 'name', 50).lower()
        if role_id and role.name in SYSTEM_ROLES and name != role.name:
            raise APIError('No se puede cambiar el nombre de un rol base.', 409)
        query = Role.query.filter_by(name=name)
        if role_id:
            query = query.filter(Role.id != role_id)
        if query.first():
            raise APIError('El rol ya existe.', 409)
        values['name'] = name
    if 'description' in data:
        description = data['description']
        if description is not None and (not isinstance(description, str) or len(description) > 200):
            raise APIError('description debe ser texto de hasta 200 caracteres o null.')
        values['description'] = description
    if 'is_active' in data:
        active = boolean(data['is_active'])
        if not active and role_id and role.name == 'admin':
            raise APIError('El rol admin debe permanecer activo.', 409)
        if not active and role_id and User.query.filter_by(role_id=role_id, is_active=True).first():
            raise APIError('El rol tiene usuarios activos. Reasígnalos antes de desactivarlo.', 409)
        values['is_active'] = active
    for key, value in values.items():
        setattr(role, key, value)
    db.session.add(role)
    db.session.commit()
    return success('Rol guardado.', role=role.to_dict()), 200 if role_id else 201
