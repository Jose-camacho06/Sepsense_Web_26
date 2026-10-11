from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User


def login_service(email, password):
    email = (email or '').strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        return {'message': 'Usuario no encontrado'}
    if not user.check_password(password or ''):
        return {'message': 'Contraseña incorrecta'}
    if not user.is_active:
        return {'message': 'Usuario inactivo'}

    identity = str(user.id)
    return {
        'ok': True,
        'message': 'Login exitoso',
        'access_token': create_access_token(identity=identity),
        'refresh_token': create_refresh_token(identity=identity),
        'token_type': 'Bearer',
        'expires_in': int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()),
        'user': user.to_dict(),
    }