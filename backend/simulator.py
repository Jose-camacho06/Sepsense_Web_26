"""Simulador de lecturas para SepSense (datos ficticios, solo para pruebas y demostración)."""
import argparse
import json
import os
import random
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from app import create_app
from app.extensions import db
from app.models import Alert, Patient, Reading

load_dotenv()

API_URL = 'http://127.0.0.1:5000/api/readings/ingest'

PATIENTS = [
    {'identification': 'SIM-001', 'first_name': 'Paciente', 'last_name': 'Estable', 'scenario': 'estable'},
    {'identification': 'SIM-002', 'first_name': 'Paciente', 'last_name': 'Deterioro', 'scenario': 'deterioro'},
    {'identification': 'SIM-003', 'first_name': 'Paciente', 'last_name': 'Crítico', 'scenario': 'critico'},
]


def prepare(reset):
    """Crea los pacientes ficticios y, si se pide, borra sus lecturas y alertas anteriores."""
    app = create_app()
    with app.app_context():
        ids = {}
        for item in PATIENTS:
            patient = Patient.query.filter_by(identification=item['identification']).first()
            if not patient:
                patient = Patient(
                    identification=item['identification'],
                    first_name=item['first_name'],
                    last_name=item['last_name'],
                    notes='Paciente simulado para pruebas.',
                )
                db.session.add(patient)
                db.session.commit()
                print(f"Creado: {item['first_name']} {item['last_name']} (id {patient.id})")
            ids[item['identification']] = patient.id

        if reset:
            sim_ids = list(ids.values())
            Alert.query.filter(Alert.patient_id.in_(sim_ids)).delete(synchronize_session=False)
            Reading.query.filter(Reading.patient_id.in_(sim_ids)).delete(synchronize_session=False)
            db.session.commit()
            print('Lecturas y alertas simuladas anteriores borradas.')
        return ids


def lerp(start, end, progress):
    return start + (end - start) * progress


def vitals(scenario, progress):
    """progress va de 0 (inicio) a 1 (peor punto); solo afecta al escenario de deterioro."""
    g = random.gauss
    if scenario == 'estable':
        v = dict(rr=g(16, 1), spo2=g(97, 0.8), sys=g(122, 4), dia=g(78, 3), hr=g(76, 4), temp=g(36.8, 0.2))
        oxygen, consciousness = False, 'A'
    elif scenario == 'deterioro':
        p = progress
        v = dict(
            rr=g(lerp(16, 26, p), 1), spo2=g(lerp(97, 91, p), 0.6),
            sys=g(lerp(122, 92, p), 3), dia=g(lerp(78, 58, p), 2),
            hr=g(lerp(78, 122, p), 3), temp=g(lerp(36.9, 38.9, p), 0.15),
        )
        oxygen, consciousness = p > 0.7, ('C' if p > 0.8 else 'A')
    else:
        v = dict(rr=g(27, 1), spo2=g(90, 0.6), sys=g(88, 3), dia=g(55, 2), hr=g(128, 4), temp=g(39.3, 0.2))
        oxygen, consciousness = True, 'C'

    return {
        'respiratory_rate': int(round(v['rr'])),
        'spo2': round(min(v['spo2'], 100), 1),
        'supplemental_oxygen': oxygen,
        'systolic': int(round(v['sys'])),
        'diastolic': int(round(v['dia'])),
        'heart_rate': int(round(v['hr'])),
        'temperature': round(v['temp'], 1),
        'consciousness': consciousness,
    }


def send(payload, key):
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'X-Device-Key': key},
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        return json.loads(error.read().decode('utf-8'))


def report(label, item, result):
    if result.get('ok'):
        r = result['reading']
        alerts = ', '.join(a['message'] for a in result['alerts']) or 'sin alertas nuevas'
        print(f"{label} {item['last_name']:<10} NEWS2={r['news2']} qSOFA={r['qsofa']} IS={r['shock_index']} -> {alerts}")
    else:
        print(f"{label} {item['last_name']:<10} ERROR: {result.get('message')}")


def main():
    parser = argparse.ArgumentParser(description='Simulador de lecturas de SepSense')
    parser.add_argument('--history', type=float, default=0, help='horas de historial a generar antes del modo en vivo')
    parser.add_argument('--every', type=int, default=15, help='minutos entre lecturas del historial (por defecto 15)')
    parser.add_argument('--reset', action='store_true', help='borra las lecturas y alertas simuladas anteriores')
    parser.add_argument('--interval', type=float, default=5, help='segundos entre rondas en vivo (por defecto 5)')
    parser.add_argument('--steps', type=int, default=0, help='rondas en vivo (0 = sin límite)')
    args = parser.parse_args()

    key = os.getenv('DEVICE_API_KEY')
    if not key:
        raise SystemExit('Falta DEVICE_API_KEY en el .env')

    ids = prepare(args.reset)

    if args.history > 0:
        total = int(args.history * 60 / args.every)
        now = datetime.now(timezone.utc)
        print(f'Generando {total} lecturas por paciente ({args.history} h)...')
        for i in range(total):
            moment = now - timedelta(minutes=args.every * (total - i))
            # El deterioro empieza a mitad del historial y llega a su peor punto al final.
            progress = max(0.0, (i / max(total - 1, 1) - 0.4) / 0.6)
            for item in PATIENTS:
                payload = {
                    'patient_id': ids[item['identification']],
                    'source': 'simulated',
                    'recorded_at': moment.isoformat(),
                }
                payload.update(vitals(item['scenario'], progress))
                result = send(payload, key)
                if result.get('alerts') or not result.get('ok'):
                    report(f"[{moment.astimezone():%H:%M}]", item, result)
        print('Historial listo.')

    if args.steps == 0 and args.history > 0:
        print('Modo en vivo... (Ctrl+C para detener)')
    elif args.steps == 0:
        print('Enviando lecturas... (Ctrl+C para detener)')

    step = 0
    try:
        while args.steps == 0 or step < args.steps:
            # Si hubo historial, el deterioro ya está en su peor punto.
            progress = 1.0 if args.history > 0 else min(step / 40, 1)
            for item in PATIENTS:
                payload = {'patient_id': ids[item['identification']], 'source': 'simulated'}
                payload.update(vitals(item['scenario'], progress))
                report(f'[{step:03}]', item, send(payload, key))
            step += 1
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print('\nSimulador detenido.')


if __name__ == '__main__':
    main()