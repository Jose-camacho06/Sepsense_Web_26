"""Revocación persistente de JWT."""
from alembic import op
import sqlalchemy as sa
revision = '20261001_blocklist'
down_revision = '77edaf77fc95'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('token_blocklist', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('jti', sa.String(36), nullable=False, unique=True), sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False))

def downgrade():
    op.drop_table('token_blocklist')
