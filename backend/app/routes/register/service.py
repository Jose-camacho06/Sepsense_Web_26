from app.models.user import User
from app.extensions import db

def register_service(email, password, confirm_password):
    if not email or not password or not confirm_password:
        return {'message': 'Todos los campos son obligatorios'}

    if password != confirm_password:
        return {'message': 'Las contraseñas no coinciden'}

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return {'message': 'El correo ya está registrado'}

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return {
        'message': 'Registro exitoso',
        'user': {
            'id': new_user.id,
            'email': new_user.email
        }
    }