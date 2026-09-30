from flask import Blueprint
from .controller import solicitar_codigo_controller, validar_codigo_controller

forgot_password_bp = Blueprint('forgot_password', __name__, url_prefix='/api/auth')

@forgot_password_bp.post('/forgot-password')
def forgot_password():
    return solicitar_codigo_controller()

@forgot_password_bp.post('/reset-password')
def reset_password():
    return validar_codigo_controller()