from flask import request, jsonify
from .service import register_service

def register_controller():
    data = request.get_json() or {}
    if not data:
        return jsonify({'message': 'Datos de registro no proporcionados'}), 400

    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')

    result = register_service(email, password, confirm_password)
    return jsonify(result), 200 if result.get('message') == 'Registro exitoso' else 400