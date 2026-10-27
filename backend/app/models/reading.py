from datetime import datetime, timezone
from app.extensions import db


class Reading(db.Model):
    __tablename__ = 'readings'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)

    # Parámetros del NEWS2
    respiratory_rate = db.Column(db.Integer, nullable=True)       # rpm
    spo2 = db.Column(db.Float, nullable=True)                     # %
    supplemental_oxygen = db.Column(db.Boolean, nullable=True)    # sí / no
    systolic = db.Column(db.Integer, nullable=True)               # mmHg
    diastolic = db.Column(db.Integer, nullable=True)              # mmHg
    heart_rate = db.Column(db.Integer, nullable=True)             # lpm
    temperature = db.Column(db.Float, nullable=True)              # °C
    consciousness = db.Column(db.String(1), nullable=True)        # A, C, V, P o U (ACVPU)

    # Indicadores calculados por el backend al guardar
    news2 = db.Column(db.Integer, nullable=True)
    qsofa = db.Column(db.Integer, nullable=True)
    shock_index = db.Column(db.Float, nullable=True)              # FC / PAS
    modified_shock_index = db.Column(db.Float, nullable=True)     # FC / PAM

    source = db.Column(db.String(20), nullable=False, default='manual')  # manual, simulated, dataset, device
    recorded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    patient = db.relationship('Patient')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'respiratory_rate': self.respiratory_rate,
            'spo2': self.spo2,
            'supplemental_oxygen': self.supplemental_oxygen,
            'systolic': self.systolic,
            'diastolic': self.diastolic,
            'heart_rate': self.heart_rate,
            'temperature': self.temperature,
            'consciousness': self.consciousness,
            'news2': self.news2,
            'qsofa': self.qsofa,
            'shock_index': self.shock_index,
            'modified_shock_index': self.modified_shock_index,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }