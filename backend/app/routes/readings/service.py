import hmac
from datetime import datetime, timedelta, timezone
from app.common.api import APIError, success
from app.common.scores import PARAM_LABELS, SHOCK_INDEX_LIMIT, calculate
from app.extensions import db
from app.models import Alert, Patient, Reading

LEVEL_ORDER = {'bajo': 1, 'medio': 2, 'alto': 3}
EXTERNAL_SOURCES = {'simulated', 'dataset', 'device'}
LIMITS = {  # rangos fisiológicamente posibles, para rechazar errores de digitación
    'respiratory_rate': (0, 80),
    'spo2': (50, 100),
    'systolic': (40, 300),
    'diastolic': (20, 200),
    'heart_rate': (20, 250),
    'temperature': (30, 45),
}
DECIMAL_FIELDS = {'spo2', 'temperature'}


def _number(data, key):
    value = data.get(key)
    if value in (None, ''):
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise APIError(f'{key} debe ser un número.')
    low, high = LIMITS[key]
    if not low <= value <= high:
        raise APIError(f'{key} debe estar entre {low} y {high}.')
    return value if key in DECIMAL_FIELDS else int(round(value))


def _alert(reading, kind, level, score, message):
    pending = Alert.query.filter_by(patient_id=reading.patient_id, kind=kind, status='pendiente').all()
    if any(LEVEL_ORDER[a.level] >= LEVEL_ORDER[level] for a in pending):
        return None
    alert = Alert(
        patient_id=reading.patient_id,
        reading_id=reading.id,
        kind=kind,
        level=level,
        score=score,
        message=message,
        created_at=reading.created_at,
    )
    db.session.add(alert)
    return alert


def _create_alerts(r, points):
    created = []
    if r.news2 is not None and r.news2 >= 5:
        level = 'alto' if r.news2 >= 7 else 'medio'
        created.append(_alert(r, 'news2', level, r.news2, f'NEWS2 de {r.news2}: riesgo {level}'))
    elif any(p == 3 for p in points.values()):
        names = ', '.join(PARAM_LABELS[k] for k, p in points.items() if p == 3)
        created.append(_alert(r, 'news2_parameter', 'medio', 3, f'Parámetro en rango crítico: {names}'))

    if r.qsofa is not None and r.qsofa >= 2:
        created.append(_alert(r, 'qsofa', 'alto', r.qsofa, f'qSOFA de {r.qsofa}: sospecha de sepsis'))

    if r.shock_index is not None and r.shock_index >= SHOCK_INDEX_LIMIT:
        created.append(_alert(r, 'shock_index', 'medio', r.shock_index, f'Índice de shock de {r.shock_index}'))

    return [a for a in created if a]


def save_reading(data, patient_id, source, user_id=None, recorded_at=None):
    allowed = set(LIMITS) | {'supplemental_oxygen', 'consciousness'}
    if set(data) - allowed:
        raise APIError('Hay campos no admitidos en la lectura.')
    if not db.session.get(Patient, patient_id):
        raise APIError('Paciente no encontrado.', 404)

    r = Reading(
        patient_id=patient_id,
        source=source,
        recorded_by=user_id,
        created_at=recorded_at or datetime.now(timezone.utc),
    )
    for key in LIMITS:
        setattr(r, key, _number(data, key))

    oxygen = data.get('supplemental_oxygen')
    if oxygen is not None:
        if type(oxygen) is not bool:
            raise APIError('supplemental_oxygen debe ser true o false.')
        r.supplemental_oxygen = oxygen

    consciousness = data.get('consciousness')
    if consciousness not in (None, ''):
        consciousness = str(consciousness).upper()
        if consciousness not in ('A', 'C', 'V', 'P', 'U'):
            raise APIError('consciousness debe ser A, C, V, P o U.')
        r.consciousness = consciousness

    values = [getattr(r, k) for k in LIMITS] + [r.supplemental_oxygen, r.consciousness]
    if all(v is None for v in values):
        raise APIError('La lectura no tiene ningún valor.')
    if r.systolic and r.diastolic and r.diastolic >= r.systolic:
        raise APIError('La diastólica debe ser menor que la sistólica.')

    points, r.news2, r.qsofa, r.shock_index, r.modified_shock_index = calculate(r)
    db.session.add(r)
    db.session.flush()
    alerts = _create_alerts(r, points)
    db.session.commit()
    return success(
        'Lectura registrada.',
        reading=r.to_dict(),
        alerts=[a.to_dict() for a in alerts],
    ), 201

def _parse_recorded_at(value):
    if value in (None, ''):
        return None
    try:
        moment = datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise APIError('recorded_at debe ser una fecha ISO, por ejemplo 2026-10-24T15:30:00Z.')
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    if moment > datetime.now(timezone.utc) + timedelta(minutes=1):
        raise APIError('recorded_at no puede estar en el futuro.')
    return moment


def ingest_reading(data, received_key, expected_key):
    if not expected_key or not hmac.compare_digest(received_key, expected_key):
        raise APIError('Clave de dispositivo inválida.', 401)

    data = dict(data)
    patient_id = data.pop('patient_id', None)
    source = data.pop('source', 'simulated')
    recorded_at = _parse_recorded_at(data.pop('recorded_at', None))
    if type(patient_id) is not int:
        raise APIError('patient_id debe ser un entero.')
    if source not in EXTERNAL_SOURCES:
        raise APIError('source debe ser simulated, dataset o device.')
    if recorded_at and source == 'device':
        raise APIError('El dispositivo no puede enviar lecturas con hora propia.')
    return save_reading(data, patient_id, source, recorded_at=recorded_at)


def list_alerts(status):
    query = Alert.query
    if status in ('pendiente', 'atendida'):
        query = query.filter_by(status=status)
    alerts = query.order_by(Alert.created_at.desc()).limit(200).all()
    alerts.sort(key=lambda a: (LEVEL_ORDER.get(a.level, 0), a.created_at), reverse=True)
    return success('Alertas consultadas.', alerts=[a.to_dict() for a in alerts])


def attend_alert(alert_id, data, user_id):
    alert = db.session.get(Alert, alert_id)
    if not alert:
        raise APIError('Alerta no encontrada.', 404)
    if alert.status == 'atendida':
        raise APIError('La alerta ya fue atendida.', 409)

    note = data.get('note')
    if note is not None and (not isinstance(note, str) or len(note) > 1000):
        raise APIError('note debe ser texto de máximo 1000 caracteres.')

    alert.status = 'atendida'
    alert.note = (note or '').strip() or None
    alert.attended_by = user_id
    alert.attended_at = datetime.now(timezone.utc)
    db.session.commit()
    return success('Alerta atendida.', alert=alert.to_dict())

def clinical_summary():
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    patients = Patient.query.filter_by(is_active=True).all()
    by_risk = {'alto': 0, 'medio': 0, 'bajo': 0, 'normal': 0}
    worsening = []

    for p in patients:
        pending = Alert.query.filter_by(patient_id=p.id, status='pendiente').all()
        risk = max((a.level for a in pending), key=LEVEL_ORDER.get, default='normal')
        by_risk[risk] += 1

        last = Reading.query.filter_by(patient_id=p.id).order_by(Reading.created_at.desc()).first()
        before = (
            Reading.query.filter(Reading.patient_id == p.id, Reading.created_at <= hour_ago)
            .order_by(Reading.created_at.desc())
            .first()
        )
        if last and before and last.news2 is not None and before.news2 is not None and last.news2 > before.news2:
            worsening.append({
                'patient_id': p.id,
                'name': f'{p.first_name} {p.last_name}',
                'from': before.news2,
                'to': last.news2,
                'risk': risk,
            })

    worsening.sort(key=lambda w: w['to'] - w['from'], reverse=True)
    recent = Alert.query.order_by(Alert.created_at.desc()).limit(8).all()

    return success('Resumen clínico.', summary={
        'total_patients': len(patients),
        'by_risk': by_risk,
        'pending_alerts': Alert.query.filter_by(status='pendiente').count(),
        'readings_last_hour': Reading.query.filter(Reading.created_at >= hour_ago).count(),
        'worsening': worsening[:5],
        'recent_alerts': [a.to_dict() for a in recent],
    })