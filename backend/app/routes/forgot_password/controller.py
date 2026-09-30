from flask import request, jsonify
from .service import solicitar_codigo_service, validar_codigo_service

def solicitar_codigo_controller():
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Correo no proporcionado'}), 400

    result = solicitar_codigo_service(email)
    return jsonify(result), 200 if result.get('message') == 'Código enviado' else 404


def validar_codigo_controller():
    data = request.get_json() or {}
    email = data.get('email')
    codigo = data.get('codigo')
    nueva_contrasena = data.get('nuevaContrasena')
    confirmar_contrasena = data.get('confirmarContrasena')

    if not email or not codigo or not nueva_contrasena or not confirmar_contrasena:
        return jsonify({'message': 'Todos los campos son obligatorios'}), 400

    result = validar_codigo_service(email, codigo, nueva_contrasena, confirmar_contrasena)
    return jsonify(result), 200 if result.get('message') == 'Contraseña actualizada' else 400