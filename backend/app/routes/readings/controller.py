from flask import current_app, g, request
from .service import attend_alert, clinical_summary, ingest_reading, list_alerts, save_reading


def _json():
    return request.get_json(silent=True) or {}


def manual_reading_controller(patient_id):
    return save_reading(_json(), patient_id, 'manual', g.user.id)


def ingest_controller():
    return ingest_reading(
        _json(),
        request.headers.get('X-Device-Key', ''),
        current_app.config.get('DEVICE_API_KEY') or '',
    )


def alerts_controller():
    return list_alerts(request.args.get('status', 'pendiente'))


def attend_controller(alert_id):
    return attend_alert(alert_id, _json(), g.user.id)

def summary_controller():
    return clinical_summary()