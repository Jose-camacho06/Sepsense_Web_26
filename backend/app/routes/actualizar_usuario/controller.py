from flask import request, jsonify
from .service import update_password_service

def update_password_controller():
    data = request.get_json() or {}

    user_id = data.get('id')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    confirm_password = data.get('confirmPassword')

    if not user_id or not current_password or not new_password or not confirm_password:
        return jsonify({'message': 'Todos los campos son obligatorios'}), 400

    result = update_password_service(user_id, current_password, new_password, confirm_password)
    return jsonify(result), 200 if result.get('message') == 'Contraseña actualizada' else 400