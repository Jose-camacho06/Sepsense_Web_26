from flask import Blueprint
from .controller import register_controller

register_bp = Blueprint('register', __name__, url_prefix='/api/auth')

@register_bp.post('/register')
def register():
    return register_controller()