from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, migrate
from app.routes.login.route import login_bp
from app.routes.register.route import register_bp
from app.routes.forgot_password.route import forgot_password_bp
from app.routes.actualizar_usuario.route import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    migrate.init_app(app, db)   

    CORS(app, origins=['http://localhost:4200'])

    app.register_blueprint(login_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(forgot_password_bp)
    app.register_blueprint(users_bp)
    return app