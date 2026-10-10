from app.common.api import body, success
from .service import save_user, list_users, get_user, deactivate_user

def create_user_controller():
    return save_user(body())

def get_users_controller():
    return list_users()

def get_user_controller(user_id):
    return success('Usuario encontrado.', user=get_user(user_id).to_dict())

def update_user_controller(user_id):
    return save_user(body(), user_id)

def delete_user_controller(user_id):
    return deactivate_user(user_id)
