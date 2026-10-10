from flask import Blueprint

from app.common.auth import protected
from .controller import dashboard_controller


dashboard_bp = Blueprint(
    'dashboard',
    __name__,
    url_prefix='/api/dashboard',
)


# El Dashboard contiene estadísticas globales: solo admin.
dashboard_bp.add_url_rule(
    '',
    view_func=protected(admin=True)(dashboard_controller),
    methods=['GET'],
)
