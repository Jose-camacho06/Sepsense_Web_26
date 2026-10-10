from datetime import datetime, timezone

from flask import g
from sqlalchemy import func

from app.common.api import success
from app.extensions import db
from app.models import Role, User


MONTHS_TO_SHOW = 6


def _month_key(year, month):
    return f'{year:04d}-{month:02d}'


def _previous_months(total):
    """Devuelve los últimos N meses, incluido el actual, en orden ascendente."""
    now = datetime.now(timezone.utc)
    year = now.year
    month = now.month
    values = []

    for offset in range(total - 1, -1, -1):
        current_month = month - offset
        current_year = year

        while current_month <= 0:
            current_month += 12
            current_year -= 1

        values.append(
            _month_key(
                current_year,
                current_month,
            )
        )

    return values


def _registrations_by_month():
    months = _previous_months(MONTHS_TO_SHOW)
    counts = {
        month: 0
        for month in months
    }

    users = User.query.with_entities(
        User.created_at
    ).all()

    for row in users:
        created_at = row[0]

        if not created_at:
            continue

        key = _month_key(
            created_at.year,
            created_at.month,
        )

        if key in counts:
            counts[key] += 1

    return [
        {
            'month': month,
            'total': counts[month],
        }
        for month in months
    ]


def dashboard_service():
    total_users = User.query.count()
    active_users = User.query.filter_by(
        is_active=True
    ).count()

    rows = (
        db.session.query(
            Role.name,
            func.count(User.id),
        )
        .outerjoin(
            User,
            User.role_id == Role.id,
        )
        .group_by(
            Role.id,
            Role.name,
        )
        .order_by(Role.id)
        .all()
    )

    dashboard = {
        'profile': g.user.to_dict(),
        'permissions': {
            'manage_users': True,
            'manage_roles': True,
            'view_dashboard': True,
        },
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'total_roles': Role.query.count(),
            'active_roles': Role.query.filter_by(
                is_active=True
            ).count(),
        },
        'users_by_role': [
            {
                'role': name,
                'total': count,
            }
            for name, count in rows
        ],
        'registrations_by_month': _registrations_by_month(),
        'recent_users': [
            user.to_dict()
            for user in (
                User.query
                .order_by(
                    User.created_at.desc(),
                    User.id.desc(),
                )
                .limit(5)
                .all()
            )
        ],
    }

    return success(
        'Dashboard consultado.',
        dashboard=dashboard,
    )
