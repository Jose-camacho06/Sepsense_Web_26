from functools import wraps
from flask import g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models import User
from .api import APIError

def current_user():
    try:
        user_id = int(get_jwt_identity())
    except (ValueError, TypeError):
        raise APIError('Identidad inválida.', 401)
    user = db.session.get(User, user_id)
    if not user or not user.is_active or not user.role or not user.role.is_active:
        raise APIError('La cuenta o su rol no están activos.', 401)
    return user

def protected(admin=False, refresh=False, any_token=False):
    def decorator(fn):
        @wraps(fn)
        def wrapped(*args, **kwargs):
            verify_jwt_in_request(refresh=refresh, verify_type=not any_token)
            g.user = current_user()
            if admin and g.user.role.name != 'admin':
                raise APIError('No tienes permisos para esta operación.', 403)
            return fn(*args, **kwargs)
        return wrapped
    return decorator
