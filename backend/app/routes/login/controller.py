from flask import request, jsonify
from .service import login_service

def login_controller():
    data=request.get_json() or{}
    if not data:
        return jsonify({
            'message': 'Datos de inicio de sesión no proporcionados'
            }), 400

    email = data.get('email')
    password = data.get('password')

    result=login_service(email, password)
    return jsonify(result), 200 if result.get('message') == 'Login exitoso' else 401