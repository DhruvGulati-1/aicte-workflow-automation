# RegulaFlow AI Backend — SIH26262 MVP

Backend starter using Node.js, Express and PostgreSQL. Demo only; not an official AICTE system.

## Requirements
Node.js 20+ and Docker Desktop (or PostgreSQL 14+).

## Run in VS Code terminal
1. Extract this folder and open it in VS Code.
2. Run `npm install`
3. Start database: `docker compose up -d`
4. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`)
5. In `.env`, set `JWT_SECRET` to a random secret at least 32 characters long.
6. Run `npm run seed`
7. Run `npm run dev`
8. Visit `http://localhost:4000/api/v1/health`

Local demo credentials use `ChangeMe123!` unless `DEMO_SEED_PASSWORD` is changed.

## Endpoints
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- Institutions: `GET /api/v1/institutions`, `POST /api/v1/institutions/import` (ADMIN)
- Applications: `POST /api/v1/applications`, `GET /api/v1/applications`, `GET /api/v1/applications/:id`
- Workflow: `POST /api/v1/applications/:id/revert`, `/resubmit`, `/complete-stage`
- History: `GET /api/v1/applications/:id/history`
- Compliance: `GET/POST /api/v1/compliance`, `POST /api/v1/compliance/:id/verify`
- Expiry: `GET /api/v1/documents/expiring?days=30`
- EVC: `GET/POST /api/v1/evc`, `PATCH /api/v1/evc/:id/schedule`, `POST /api/v1/evc/:id/complete`
- Notifications: `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`
- Dashboard: `GET /api/v1/dashboard/summary`, `GET /api/v1/dashboard/ageing`
- Audit: `GET /api/v1/audit-logs` (ADMIN or COMPETENT_AUTHORITY)
- Health: `GET /api/v1/health`

Workflow path values: `ONLY_SCRUTINY`, `SCRUTINY_EVC`, `EVC_SAC_SHC`, `ONLY_EVC`.

## Public dataset
The import endpoint accepts JSON records with `officialId`, `name`, `state`, `district`, `address`, `institutionType`, `sourceName`, `sourceUrl`, and `sourceSnapshotDate`. Import only verified public records and retain source information. Old public institution data must not be presented as current approval status.

## Important MVP limitations
- Seeded users, application, compliance record, and EVC records are simulated demo data.
- No real AICTE operational data or official integration is included.
- This MVP does not include file upload/storage, email delivery, password reset, formal Swagger UI, or automated test suite.
- Scheduled compliance checks run daily at 08:00 server time.
- Before production, add full tests, security review, officer assignment scope rules, document storage scanning, backups, password reset, token revocation, and deployment secrets.
