from datetime import datetime, timezone
from werkzeug.security import (
    check_password_hash,
    generate_password_hash
)
from app.extensions import db
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    identification = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )
    first_name = db.Column(
        db.String(100),
        nullable=False
    )
    last_name = db.Column(
        db.String(100),
        nullable=False
    )
    email = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )
    password_hash = db.Column(
        db.String(255),
        nullable=False
    )
    role_id = db.Column(
        db.Integer,
        db.ForeignKey('roles.id'),
        nullable=False
    )
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    role = db.relationship(
        'Role',
        back_populates='users'
    )
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    def to_dict(self):
        return {
            'id': self.id,
            'identification': self.identification,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'role_id': self.role_id,
            'role': self.role.name if self.role else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
