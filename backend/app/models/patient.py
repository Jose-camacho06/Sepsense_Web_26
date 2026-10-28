from datetime import date, datetime, timezone
from app.extensions import db


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    identification = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=True)
    sex = db.Column(db.String(10), nullable=True)
    floor = db.Column(db.String(20), nullable=True, index=True)   # piso
    room = db.Column(db.String(20), nullable=True)                # habitación
    notes = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def age(self):
        if not self.birth_date:
            return None
        today = date.today()
        before_birthday = (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        return today.year - self.birth_date.year - before_birthday

    def to_dict(self):
        return {
            'id': self.id,
            'identification': self.identification,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'age': self.age(),
            'sex': self.sex,
            'floor': self.floor,
            'room': self.room,
            'notes': self.notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        } 