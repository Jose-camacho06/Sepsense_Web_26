# Puntajes según la Tabla 1 del documento (NEWS2, escala 1 de SpO2).
# Cada banda es (límite superior, puntos); el segundo valor son los puntos si se pasa del último límite.

RESPIRATORY_RATE = ([(8, 3), (11, 1), (20, 0), (24, 2)], 3)
SPO2 = ([(91, 3), (93, 2), (95, 1)], 0)
SYSTOLIC = ([(90, 3), (100, 2), (110, 1), (219, 0)], 3)
HEART_RATE = ([(40, 3), (50, 1), (90, 0), (110, 1), (130, 2)], 3)
TEMPERATURE = ([(35.0, 3), (36.0, 1), (38.0, 0), (39.0, 1)], 2)

SHOCK_INDEX_LIMIT = 1.0  # confirmar con el médico o la revisión bibliográfica

PARAM_LABELS = {
    'respiratory_rate': 'frecuencia respiratoria',
    'spo2': 'SpO2',
    'supplemental_oxygen': 'oxígeno suplementario',
    'systolic': 'PA sistólica',
    'heart_rate': 'frecuencia cardíaca',
    'temperature': 'temperatura',
    'consciousness': 'nivel de conciencia',
}


def _points(value, table):
    bands, above = table
    for limit, points in bands:
        if value <= limit:
            return points
    return above


def calculate(r):
    """Devuelve (puntos por parámetro, NEWS2, qSOFA, índice de shock, índice de shock modificado)."""
    points = {}
    if r.respiratory_rate is not None:
        points['respiratory_rate'] = _points(r.respiratory_rate, RESPIRATORY_RATE)
    if r.spo2 is not None:
        points['spo2'] = _points(r.spo2, SPO2)
    if r.supplemental_oxygen is not None:
        points['supplemental_oxygen'] = 2 if r.supplemental_oxygen else 0
    if r.systolic is not None:
        points['systolic'] = _points(r.systolic, SYSTOLIC)
    if r.heart_rate is not None:
        points['heart_rate'] = _points(r.heart_rate, HEART_RATE)
    if r.temperature is not None:
        points['temperature'] = _points(r.temperature, TEMPERATURE)
    if r.consciousness is not None:
        points['consciousness'] = 0 if r.consciousness == 'A' else 3

    # El NEWS2 total solo es válido con los 7 parámetros.
    news2 = sum(points.values()) if len(points) == 7 else None

    qsofa = None
    if None not in (r.respiratory_rate, r.systolic, r.consciousness):
        qsofa = int(r.respiratory_rate >= 22) + int(r.systolic <= 100) + int(r.consciousness != 'A')

    shock_index = None
    modified_shock_index = None
    if r.heart_rate and r.systolic:
        shock_index = round(r.heart_rate / r.systolic, 2)
        if r.diastolic:
            mean_pressure = (r.systolic + 2 * r.diastolic) / 3
            modified_shock_index = round(r.heart_rate / mean_pressure, 2)

    return points, news2, qsofa, shock_index, modified_shock_index