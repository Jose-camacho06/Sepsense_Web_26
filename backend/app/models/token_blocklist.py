from app.extensions import db

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)