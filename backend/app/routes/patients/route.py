from flask import Blueprint
from app.common.clinical import clinical
from . import controller as c

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')

patients_bp.add_url_rule('', view_func=clinical(c.list_controller), methods=['GET'])
patients_bp.add_url_rule('', view_func=clinical(c.create_controller), methods=['POST'])
patients_bp.add_url_rule('/<int:patient_id>', view_func=clinical(c.get_controller), methods=['GET'])
patients_bp.add_url_rule('/<int:patient_id>', view_func=clinical(c.update_controller), methods=['PATCH'])