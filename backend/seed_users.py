from getpass import getpass

from sqlalchemy import func, or_

from app import create_app
from app.extensions import db
from app.models.role import Role
from app.models.user import User


USERS = [
    {
        'identification': '100000001',
        'first_name': 'Jose',
        'last_name': 'Camacho',
        'email': 'camacho@uces.edu.co',
        'role': 'admin',
        'is_active': True,
    },
    {
        'identification': '100000002',
        'first_name': 'Docente',
        'last_name': 'Ejemplo',
        'email': 'teacher@uces.edu.co',
        'role': 'teacher',
        'is_active': True,
    },
    {
        'identification': '100000003',
        'first_name': 'Estudiante',
        'last_name': 'Ejemplo',
        'email': 'student@uces.edu.co',
        'role': 'student',
        'is_active': True,
    },
    {
        'identification': '100000004',
        'first_name': 'Doctor',
        'last_name': 'Menges',
        'email': 'doctor@uces.edu.co',
        'role': 'doctor',
        'is_active': True,
    },
]


def seed_users():
    app = create_app()

    with app.app_context():
        created = 0
        skipped = 0

        try:
            for item in USERS:
                values = {}
                for field in ('identification', 'first_name', 'last_name', 'email', 'role'):
                    value = item.get(field)
                    if not isinstance(value, str) or not value.strip():
                        raise ValueError(f"El campo '{field}' es obligatorio y debe ser texto.")
                    values[field] = value.strip()
                    if field != 'role' and len(values[field]) > 100:
                        raise ValueError(f"El campo '{field}' excede 100 caracteres.")

                email = values['email'].lower()
                identification = values['identification']
                is_active = item.get('is_active', True)
                if not isinstance(is_active, bool):
                    raise ValueError(f"is_active debe ser True o False para {email}.")

                existing = User.query.filter(
                    or_(
                        User.identification == identification,
                        func.lower(User.email) == email,
                    )
                ).first()

                if existing:
                    print(f"Omitido: {email}; identificación o correo ya registrado.")
                    skipped += 1
                    continue

                role = Role.query.filter_by(name=values['role']).first()
                if role is None:
                    raise ValueError(
                        f"El rol '{values['role']}' no existe. Ejecuta seed_roles.py primero."
                    )
                if not role.is_active:
                    raise ValueError(f"El rol '{values['role']}' está inactivo.")

                password = item.get('password')
                if password is None:
                    password = getpass(f"Contraseña para {email}: ")
                    confirmation = getpass('Confirma la contraseña: ')
                    if password != confirmation:
                        raise ValueError(f"Las contraseñas no coinciden para {email}.")
                if not isinstance(password, str) or not password.strip():
                    raise ValueError(f"La contraseña no puede estar vacía para {email}.")

                user = User(
                    identification=identification,
                    first_name=values['first_name'],
                    last_name=values['last_name'],
                    email=email,
                    role_id=role.id,
                    is_active=is_active,
                )
                user.set_password(password)
                db.session.add(user)
                db.session.flush()
                created += 1

            db.session.commit()
            print(f"Proceso finalizado. Creados: {created}. Omitidos: {skipped}.")
        except Exception:
            db.session.rollback()
            print('Proceso cancelado: no se guardaron nuevos usuarios en esta ejecución.')
            raise


if __name__ == '__main__':
    seed_users()