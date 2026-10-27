from functools import wraps
from flask import g
from .api import APIError
from .auth import protected

# Roles que pueden ver y registrar pacientes.
CLINICAL_ROLES = {'doctor', 'enfermero'}


def clinical(fn):
    @protected()
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if g.user.role.name not in CLINICAL_ROLES:
            raise APIError('Solo el personal clínico puede acceder a los pacientes.', 403)
        return fn(*args, **kwargs)
    return wrapped