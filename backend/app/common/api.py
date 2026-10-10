from flask import request
from werkzeug.exceptions import HTTPException

class APIError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status

def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        raise APIError('Se requiere un objeto JSON con datos.')
    return data

def text(data, key, limit, required=True):
    value = data.get(key)
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip() or len(value.strip()) > limit:
        raise APIError(f'{key} es obligatorio y debe tener entre 1 y {limit} caracteres.')
    return value.strip()

def password(data, key='password'):
    value = data.get(key)
    if not isinstance(value, str) or not 8 <= len(value) <= 128 or not value.strip():
        raise APIError('La contraseña debe tener entre 8 y 128 caracteres.')
    return value

def boolean(value):
    if type(value) is not bool:
        raise APIError('is_active debe ser un booleano.')
    return value

def success(message, **data):
    return dict(ok=True, message=message, **data)
