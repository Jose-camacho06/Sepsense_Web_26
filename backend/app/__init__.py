from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import HTTPException
from config import Config
from app.extensions import db, migrate, jwt
from app.models import TokenBlocklist
from app.common.api import APIError

from app.routes.login.route import login_bp
from app.routes.register.route import register_bp
from app.routes.forgot_password.route import forgot_password_bp
from app.routes.actualizar_usuario.route import users_bp
from app.routes.users.route import users_bp as admin_users_bp
from app.routes.roles.route import roles_bp
from app.routes.dashboard.route import dashboard_bp


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise RuntimeError('Configura DATABASE_URL en .env.')
    secret = app.config.get('JWT_SECRET_KEY')
    if not secret or len(secret) < 32 or secret.startswith('REEMPLAZA'):
        raise RuntimeError('Configura JWT_SECRET_KEY con un secreto aleatorio de al menos 32 caracteres.')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}}, allow_headers=['Content-Type', 'Authorization'])

    for blueprint in (login_bp, register_bp, forgot_password_bp, users_bp, admin_users_bp, roles_bp, dashboard_bp):
        app.register_blueprint(blueprint)

    def failure(message, status):
        return jsonify(ok=False, message=message), status

    @jwt.token_in_blocklist_loader
    def revoked(header, payload):
        return TokenBlocklist.query.filter_by(jti=payload['jti']).first() is not None

    @jwt.unauthorized_loader
    def missing(reason):
        return failure('Se requiere un token Bearer.', 401)

    @jwt.invalid_token_loader
    def invalid(reason):
        return failure('Token inválido.', 401)

    @jwt.expired_token_loader
    def expired(header, payload):
        return failure('El token ha expirado.', 401)

    @jwt.revoked_token_loader
    def blocked(header, payload):
        return failure('El token fue revocado.', 401)

    @app.errorhandler(APIError)
    def api_error(error):
        db.session.rollback()
        return failure(error.message, error.status)

    @app.errorhandler(IntegrityError)
    def conflict(error):
        db.session.rollback()
        return failure('Los datos entran en conflicto con un registro existente.', 409)

    @app.errorhandler(SQLAlchemyError)
    def database_error(error):
        db.session.rollback()
        app.logger.exception('Error de base de datos')
        return failure('No fue posible completar la operación en la base de datos.', 500)

    @app.errorhandler(HTTPException)
    def http_error(error):
        return failure({404: 'Ruta no encontrada.', 405: 'Método no permitido.', 415: 'Se requiere contenido JSON.'}.get(error.code, 'Solicitud no válida.'), error.code)

    @app.errorhandler(Exception)
    def unexpected(error):
        db.session.rollback()
        app.logger.exception('Error inesperado')
        return failure('No fue posible completar la operación.', 500)

    return app