from flask import Blueprint
from .controller import update_password_controller

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.post('/update-password')
def update_password():
    return update_password_controller()