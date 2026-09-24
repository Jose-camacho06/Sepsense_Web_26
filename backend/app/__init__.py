from flask import Flask, app, app
from flask_cors import CORS
from config import Config
from app.extensions import db, migrate
from app.routes.login.route import login_bp
# from app.routes.hola.route import hola

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    migrate.init_app(app, db)   

    CORS(app,origins=['http://localhost:4200'])

    app.register_blueprint(login_bp)
  # app.register_blueprint(hola)
    return app