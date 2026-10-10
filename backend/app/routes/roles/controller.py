from app.common.api import body, success
from . import service as s

def list_controller():
    return s.list_roles()
def get_controller(role_id):
    return success('Rol encontrado.', role=s.get_role(role_id).to_dict())
def create_controller():
    return s.save_role(body())
def update_controller(role_id):
    return s.save_role(body(), role_id)
def delete_controller(role_id):
    return s.save_role({'is_active': False}, role_id)
