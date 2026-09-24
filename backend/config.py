import os
from dotenv import load_dotenv 
load_dotenv()
class Config:
    SQL_DB_URI = os.getenv('DATABASE_URL')