from app.models.user import User

def login_service(email, password):

    user = User.query.filter_by(email=email).first()

    if not user:
        return{
        'message': 'Usuario no encontrado'
        }
    if not user.check_password(password):
        return{
        'message': 'Contraseña incorrecta'
        }
    return {
        'message': 'Login exitoso',
        'user': {
            'id': user.id,
            'identification': user.identification,
            'email': user.email
            }
        }