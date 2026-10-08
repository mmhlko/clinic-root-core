# Clinic fullstack app

Full-stack application with a NestJS backend, Next.js frontend, and PostgreSQL
database.

## Local development

The backend listens on port `3000`; the frontend listens on port `3001` so
both applications can run on the same machine. Next.js proxies `/api/*` and
`/uploads/*` to the backend.

1. Configure the backend:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

   Set the PostgreSQL connection values, unique `JWT_ACCESS_SECRET` and
   `JWT_REFRESH_SECRET`, and root administrator credentials in `backend/.env`.
   Set `CORS_ORIGINS` to the comma-separated browser origins allowed to call
   the backend directly. Production startup requires an explicit allowlist.
   PostgreSQL must be running and reachable at `POSTGRES_HOST:POSTGRES_PORT`.
   `DATABASE_SYNCHRONIZE` defaults to `false`; `true` is a development-only,
   explicit opt-in and is rejected in production.

2. Start the backend:

   ```powershell
   Set-Location backend
   npm install
   npm run start:dev
   ```

3. Configure and start the frontend in a second terminal:

   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   Set-Location frontend
   npm install
   npm run dev -- -p 3001
   ```

   `BACKEND_API_URL` defaults to `http://localhost:3000`. Set it to the
   backend origin when running the frontend in another environment.

## Docker Compose

The production-style `docker-compose.yml` requires database credentials,
both JWT secrets, and root administrator credentials from the environment.
Compose loads backend secrets only into the backend container; the frontend
does not receive database or JWT credentials. The backend uses the Compose
PostgreSQL service internally, regardless of the local `POSTGRES_HOST` value.
Set `CORS_ORIGINS` in `backend/.env` to the production browser origin(s). Run:

```powershell
docker compose --env-file backend/.env up --build
```

Do not use placeholder credentials or development secrets in production.
The backend is exposed on port `3000`, the frontend on port `3001`, and
PostgreSQL on port `5433` on the host.
The production backend does not create or alter tables automatically; its
PostgreSQL schema must be provisioned before startup.

`docker-compose.dev.yml` is intended only to start a local development
PostgreSQL instance; its built-in database credentials are development-only.

## Configuration

Backend startup requires `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `ROOT_ADMIN_EMAIL`, and `ROOT_ADMIN_PASSWORD`.
`PORT` defaults to `3000`. See [backend/.env.example](backend/.env.example)
and [frontend/.env.example](frontend/.env.example) for the environment
variable templates.

The backend applies Helmet security headers and accepts browser CORS requests
only from `CORS_ORIGINS` (comma-separated exact origins). Public API traffic is
rate-limited per IP; login is limited to 5 requests per 15 minutes, and public
review and appointment submissions to 3 per 10 minutes. Uploads must match
their allowed MIME type, filename extension, and detected file signature:
images are limited to 5 MiB and PDF/DOC/DOCX files to 10 MiB. SVG and HTML
uploads are not accepted; document downloads are sent as attachments.
