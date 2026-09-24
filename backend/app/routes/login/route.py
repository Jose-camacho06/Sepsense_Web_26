from flask import Blueprint
from .controller import login_controller

login_bp = Blueprint('login', __name__, url_prefix='/api/auth')

@login_bp.post('/login')
def login():
    return login_controller()

@login_bp.post('/register')
def register():
    return register_controller()  # Assuming you have a register_controller defined elsewhere

@login_bp.post('/forgot-password')
def forgot_password():
    return olvide_contrasena_controller()