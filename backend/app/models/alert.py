from datetime import datetime, timezone
from app.extensions import db


class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)
    reading_id = db.Column(db.Integer, db.ForeignKey('readings.id'), nullable=True)
    kind = db.Column(db.String(30), nullable=False)    # news2, news2_parameter, qsofa, shock_index
    score = db.Column(db.Float, nullable=True)         # valor que disparó la alerta
    message = db.Column(db.String(200), nullable=False)
    level = db.Column(db.String(10), nullable=False)   # alto, medio, bajo
    status = db.Column(db.String(20), nullable=False, default='pendiente')  # pendiente, atendida
    note = db.Column(db.Text, nullable=True)
    attended_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    attended_at = db.Column(db.DateTime(timezone=True), nullable=True)
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
            'patient_name': f'{self.patient.first_name} {self.patient.last_name}' if self.patient else None,
            'reading_id': self.reading_id,
            'kind': self.kind,
            'score': self.score,
            'message': self.message,
            'level': self.level,
            'status': self.status,
            'note': self.note,
            'attended_at': self.attended_at.isoformat() if self.attended_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }