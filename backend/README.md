# Backend de clase: Flask + PostgreSQL + JWT + Roles

Backend preparado para la clase de integración Web. Mantiene la estructura actual del proyecto y separa cada módulo en `route.py`, `controller.py` y `service.py`.

## Estructura principal

```text
app/
├── common/
│   ├── api.py
│   └── auth.py
├── models/
│   ├── user.py
│   ├── role.py
│   └── token_blocklist.py
├── routes/
│   ├── login/
│   │   ├── route.py
│   │   ├── controller.py
│   │   └── service.py
│   ├── users/
│   │   ├── route.py
│   │   ├── controller.py
│   │   └── service.py
│   ├── roles/
│   │   ├── route.py
│   │   ├── controller.py
│   │   └── service.py
│   └── dashboard/
│       ├── route.py
│       ├── controller.py
│       └── service.py
├── extensions.py
└── __init__.py
```

## 1. Instalación

Requiere Python 3.11+ y PostgreSQL.

```bash
python -m venv .venv
```

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Instalar:

```bash
pip install -r requirements.txt
```

Copiar `.env.example` como `.env` y configurar `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS` y `PUBLIC_REGISTRATION`.

Ejemplo de driver PostgreSQL utilizado:

```text
postgresql+psycopg://usuario:password@localhost:5432/web_class
```

Si aparece `ModuleNotFoundError: No module named 'psycopg'`, instalar:

```bash
pip install "psycopg[binary]"
```

Generar una clave JWT segura:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 2. Base de datos

Aplicar migraciones existentes:

```bash
flask --app run db upgrade
```

No ejecutar nuevamente `db init` si el proyecto ya contiene la carpeta `migrations/`.

Crear datos base:

```bash
python seed_roles.py
python seed_users.py
```

Roles iniciales:

```text
admin
teacher
student
doctor
```

La relación es:

```text
Role 1 ──────── N User
       role_id
```

## 3. Autenticación y autorización

El Login genera:

- `access_token`: 15 minutos.
- `refresh_token`: 7 días.

Los tokens incluyen como claims informativos `role` y `email`, pero el Backend **no confía en esos claims para autorizar**. En cada solicitud protegida se vuelve a consultar el usuario y su rol en la base de datos. Así, desactivar un usuario o un rol bloquea inmediatamente el acceso.

Enviar el access token como:

```text
Authorization: Bearer <access_token>
```

### Diferencia importante

- JWT: demuestra autenticación.
- `protected(admin=True)`: verifica autorización administrativa.
- El Front puede ocultar menús, pero la seguridad real está en Flask.

## 4. Contrato HTTP

Todas las respuestas contienen `ok` y `message`. El Front debe mostrar `message` cuando venga informado.

### Auth / perfil

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login y generación de JWT |
| POST | `/api/auth/register` | Público si está habilitado | Registro como `student` |
| GET | `/api/auth/me` | Autenticado | Consultar perfil propio |
| PUT/PATCH | `/api/auth/me` | Autenticado | Modificar solo identificación, nombre, apellido y correo propios |
| PUT | `/api/auth/change-password` | Autenticado | Cambiar contraseña propia |
| POST | `/api/auth/refresh` | Refresh token | Obtener nuevo access token |
| POST | `/api/auth/logout` | Access o refresh | Revocar el token presentado |

`/api/auth/me` **no permite** modificar `role_id`, `is_active` ni contraseña. El cambio de contraseña tiene su endpoint independiente.

### Administración de usuarios

Solo `admin`:

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/users` | Listar y filtrar usuarios |
| POST | `/api/users` | Crear usuario y asignar rol |
| GET | `/api/users/{id}` | Consultar detalle |
| PUT/PATCH | `/api/users/{id}` | Actualizar usuario, rol o estado |
| DELETE | `/api/users/{id}` | Inactivar lógicamente |

Se conservan como alias de compatibilidad:

```text
GET /api/auth/users
GET/PUT/PATCH/DELETE /api/auth/users/{id}
```

Filtros de usuarios:

```text
/api/users?page=1&per_page=10&search=ana&role_id=3&is_active=true
```

Respuesta paginada:

```json
{
  "ok": true,
  "message": "Usuarios consultados.",
  "users": [],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 0,
    "pages": 0
  }
}
```

### Roles

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/roles` | Autenticado |
| GET | `/api/roles/{id}` | Autenticado |
| POST | `/api/roles` | Admin |
| PUT/PATCH | `/api/roles/{id}` | Admin |
| DELETE | `/api/roles/{id}` | Admin |

No se puede renombrar un rol base (`admin`, `teacher`, `student`, `doctor`). El rol `admin` no puede desactivarse. Un rol con usuarios activos tampoco puede desactivarse hasta reasignar esos usuarios.

### Dashboard

```text
GET /api/dashboard
```

Acceso: **solo admin**.

Devuelve información lista para las cards y gráficos de Angular:

```text
dashboard.profile
dashboard.permissions
dashboard.stats
dashboard.users_by_role
dashboard.registrations_by_month
dashboard.recent_users
```

`stats`:

```text
total_users
active_users
inactive_users
total_roles
active_roles
```

`users_by_role` sirve para barras o gráfico circular:

```json
[
  {"role": "admin", "total": 1},
  {"role": "teacher", "total": 3}
]
```

`registrations_by_month` devuelve los últimos seis meses y sirve para gráfico de línea:

```json
[
  {"month": "2026-05", "total": 2},
  {"month": "2026-06", "total": 4}
]
```

`recent_users` contiene los últimos cinco usuarios creados.

## 5. Reglas de la clase

### Usuario admin

Puede:

- ver Dashboard;
- listar usuarios;
- crear usuarios;
- actualizar usuarios;
- asignar roles;
- inactivar usuarios;
- administrar roles.

No puede desactivar su propia cuenta ni quitarse el rol `admin` mediante el CRUD administrativo.

### Usuario no admin

Puede:

- iniciar sesión;
- consultar su perfil mediante `/api/auth/me`;
- actualizar únicamente sus propios datos personales;
- cambiar su contraseña;
- consultar el catálogo de roles si la interfaz lo requiere.

No puede:

- acceder al Dashboard global;
- listar otros usuarios;
- crear o modificar usuarios;
- modificar su propio rol;
- modificar su propio estado activo;
- administrar roles.

Intentar estas operaciones devuelve `403`.

## 6. Registro público

Ejemplo:

```json
{
  "identification": "123456",
  "first_name": "Ana",
  "last_name": "Gómez",
  "email": "ana@example.com",
  "password": "UnaClave123!"
}
```

El Backend asigna automáticamente el rol `student`. El cliente no puede elegir `role_id` ni `is_active` durante el registro público.

## 7. Creación administrativa

Primero consultar `/api/roles` y utilizar el `id` real del rol.

```json
{
  "identification": "987654",
  "first_name": "Carlos",
  "last_name": "Ruiz",
  "email": "carlos@example.com",
  "password": "UnaClave123!",
  "role_id": 2
}
```

## 8. Actualización del perfil propio

```http
PATCH /api/auth/me
```

```json
{
  "first_name": "Ana María",
  "last_name": "Gómez",
  "email": "ana.gomez@example.com"
}
```

No enviar `role_id`, `is_active` ni `password` en este endpoint.

## 9. Códigos HTTP utilizados

- `200`: operación correcta.
- `201`: recurso creado.
- `400`: validación incorrecta.
- `401`: falta autenticación, token inválido/expirado o credenciales incorrectas.
- `403`: usuario autenticado sin permisos.
- `404`: recurso inexistente.
- `409`: conflicto de negocio o duplicado.
- `500`: error interno.

## 10. Secuencia recomendada para conectar Angular

1. Login real y almacenamiento de tokens.
2. Interceptor Bearer.
3. `/api/auth/me` para obtener usuario y rol.
4. Guard de autenticación.
5. Guard administrativo para Dashboard y administración de usuarios.
6. Menú condicional por rol.
7. `users-admin`: GET/POST/PATCH/DELETE `/api/users`.
8. Perfil: GET/PATCH `/api/auth/me`.
9. Roles: GET `/api/roles` para el formulario administrativo.
10. Dashboard: GET `/api/dashboard` para cards y gráficos.

## 11. Verificación

Con las dependencias instaladas:

```bash
python -m pytest -q
```

Las pruebas usan SQLite en memoria únicamente para tests y no modifican PostgreSQL.

También se incluye `postman_collection.json` para las pruebas manuales.
