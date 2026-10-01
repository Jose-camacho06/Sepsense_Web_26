import random
from app.models.user import User
from app.extensions import db

# Diccionario temporal en memoria: email -> codigo
codigos_recuperacion = {}

def solicitar_codigo_service(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return {'message': 'Correo no encontrado'}

    codigo = str(random.randint(100000, 999999))
    codigos_recuperacion[email] = codigo

    print(f'Código de recuperación para {email}: {codigo}')  # Simula el "envío"

    return {'message': 'Código enviado', 'codigo': codigo}


def validar_codigo_service(email, codigo, nueva_contrasena, confirmar_contrasena):
    if codigos_recuperacion.get(email) != codigo:
        return {'message': 'Código incorrecto'}

    if nueva_contrasena != confirmar_contrasena:
        return {'message': 'Las contraseñas no coinciden'}

    user = User.query.filter_by(email=email).first()
    if not user:
        return {'message': 'Usuario no encontrado'}

    user.set_password(nueva_contrasena)
    db.session.commit()

    del codigos_recuperacion[email]

    return {'message': 'Contraseña actualizada'}