from flask import Blueprint
from app.common.auth import protected
from . import controller as c
users_bp = Blueprint('users', __name__, url_prefix='/api/users')
users_bp.add_url_rule('', view_func=protected(admin=True)(c.get_users_controller), methods=['GET'])
users_bp.add_url_rule('', view_func=protected(admin=True)(c.create_user_controller), methods=['POST'])
users_bp.add_url_rule('/<int:user_id>', view_func=protected(admin=True)(c.get_user_controller), methods=['GET'])
users_bp.add_url_rule('/<int:user_id>', view_func=protected(admin=True)(c.update_user_controller), methods=['PUT', 'PATCH'])
users_bp.add_url_rule('/<int:user_id>', view_func=protected(admin=True)(c.delete_user_controller), methods=['DELETE'])
