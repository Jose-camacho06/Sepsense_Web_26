from app.common.api import body
from .service import get_patient_detail, list_patients, save_patient


def list_controller():
    return list_patients()


def create_controller():
    return save_patient(body())


def get_controller(patient_id):
    return get_patient_detail(patient_id)


def update_controller(patient_id):
    return save_patient(body(), patient_id)