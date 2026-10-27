from datetime import date
from flask import g, request
from sqlalchemy import or_
from app.common.api import APIError, success, text
from app.extensions import db
from app.models import Alert, Patient, Reading

LEVEL_ORDER = {'alto': 3, 'medio': 2, 'bajo': 1}
FIELDS = {'identification', 'first_name', 'last_name', 'birth_date', 'sex', 'notes'}


def _get(patient_id):
    patient = db.session.get(Patient, patient_id)
    if not patient:
        raise APIError('Paciente no encontrado.', 404)
    return patient


def _summary(patient):
    data = patient.to_dict()
    last = (
        Reading.query.filter_by(patient_id=patient.id)
        .order_by(Reading.created_at.desc(), Reading.id.desc())
        .first()
    )
    pending = Alert.query.filter_by(patient_id=patient.id, status='pendiente').all()
    data['last_reading'] = last.to_dict() if last else None
    data['pending_alerts'] = len(pending)
    data['risk'] = max(
        (alert.level for alert in pending),
        key=lambda level: LEVEL_ORDER.get(level, 0),
        default='normal',
    )
    return data


def list_patients():
    search = request.args.get('search', '').strip()
    query = Patient.query.filter_by(is_active=True)
    if search:
        like = f'%{search}%'
        query = query.filter(or_(
            Patient.first_name.ilike(like),
            Patient.last_name.ilike(like),
            Patient.identification.ilike(like),
        ))
    patients = [_summary(p) for p in query.order_by(Patient.last_name, Patient.first_name).all()]
    patients.sort(key=lambda p: LEVEL_ORDER.get(p['risk'], 0), reverse=True)
    return success('Pacientes consultados.', patients=patients)


def get_patient_detail(patient_id):
    patient = _get(patient_id)
    readings = (
        Reading.query.filter_by(patient_id=patient_id)
        .order_by(Reading.created_at.desc(), Reading.id.desc())
        .limit(100)
        .all()
    )
    alerts = (
        Alert.query.filter_by(patient_id=patient_id)
        .order_by(Alert.created_at.desc())
        .limit(50)
        .all()
    )
    data = _summary(patient)
    data['readings'] = [r.to_dict() for r in reversed(readings)]
    data['alerts'] = [a.to_dict() for a in alerts]
    return success('Paciente consultado.', patient=data)


def _parse_date(value):
    if value in (None, ''):
        return None
    try:
        parsed = date.fromisoformat(value)
    except (TypeError, ValueError):
        raise APIError('birth_date debe tener el formato AAAA-MM-DD.')
    if parsed > date.today():
        raise APIError('La fecha de nacimiento no puede ser futura.')
    return parsed


def save_patient(data, patient_id=None):
    if set(data) - FIELDS:
        raise APIError('Hay campos no admitidos en el paciente.')

    creating = patient_id is None
    patient = Patient(created_by=g.user.id) if creating else _get(patient_id)

    if creating or 'identification' in data:
        identification = text(data, 'identification', 50)
        duplicate = Patient.query.filter(
            Patient.identification == identification,
            Patient.id != (patient.id or 0),
        ).first()
        if duplicate:
            raise APIError('Ya existe un paciente con esa identificación.', 409)
        patient.identification = identification

    for key in ('first_name', 'last_name'):
        if creating or key in data:
            setattr(patient, key, text(data, key, 100))

    if 'birth_date' in data:
        patient.birth_date = _parse_date(data['birth_date'])

    if 'sex' in data:
        sex = data['sex'] or None
        if sex not in (None, 'F', 'M', 'Otro'):
            raise APIError("sex debe ser 'F', 'M' u 'Otro'.")
        patient.sex = sex

    if 'notes' in data:
        notes = data['notes']
        if notes is not None and (not isinstance(notes, str) or len(notes) > 1000):
            raise APIError('notes debe ser texto de máximo 1000 caracteres.')
        patient.notes = (notes or '').strip() or None

    if creating:
        db.session.add(patient)
    db.session.commit()
    return success('Paciente guardado.', patient=patient.to_dict()), (201 if creating else 200)