from flask import Blueprint
from app.common.auth import protected
from . import controller as c
roles_bp = Blueprint('roles', __name__, url_prefix='/api/roles')
roles_bp.add_url_rule('', view_func=protected()(c.list_controller), methods=['GET'])
roles_bp.add_url_rule('/<int:role_id>', view_func=protected()(c.get_controller), methods=['GET'])
roles_bp.add_url_rule('', view_func=protected(admin=True)(c.create_controller), methods=['POST'])
roles_bp.add_url_rule('/<int:role_id>', view_func=protected(admin=True)(c.update_controller), methods=['PUT', 'PATCH'])
roles_bp.add_url_rule('/<int:role_id>', view_func=protected(admin=True)(c.delete_controller), methods=['DELETE'])
