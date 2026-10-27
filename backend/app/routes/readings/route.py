from flask import Blueprint
from app.common.clinical import clinical
from . import controller as c

readings_bp = Blueprint('readings', __name__, url_prefix='/api')

readings_bp.add_url_rule('/patients/<int:patient_id>/readings', view_func=clinical(c.manual_reading_controller), methods=['POST'])
readings_bp.add_url_rule('/readings/ingest', view_func=c.ingest_controller, methods=['POST'])
readings_bp.add_url_rule('/alerts', view_func=clinical(c.alerts_controller), methods=['GET'])
readings_bp.add_url_rule('/alerts/<int:alert_id>/attend', view_func=clinical(c.attend_controller), methods=['PATCH'])
readings_bp.add_url_rule('/clinical/summary', view_func=clinical(c.summary_controller), methods=['GET'])