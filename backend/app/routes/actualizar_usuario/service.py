from app.models.user import User
from app.extensions import db

def update_password_service(user_id, current_password, new_password, confirm_password):
    user = User.query.get(user_id)
    if not user:
        return {'message': 'Usuario no encontrado'}

    if not user.check_password(current_password):
        return {'message': 'Contraseña actual incorrecta'}

    if new_password != confirm_password:
        return {'message': 'Las contraseñas nuevas no coinciden'}

    user.set_password(new_password)
    db.session.commit()

    return {'message': 'Contraseña actualizada'}