# Jobify — Job Application Tracker API

A TypeScript backend prototype for tracking companies and job applications. Built to explore the backend requirements of a potential job-search SaaS product.

**Status:** backend MVP / learning project. The frontend is not implemented yet; this is **not** a production-ready hosted service.

## What it demonstrates

- REST API using **Fastify, TypeScript, Prisma and PostgreSQL**
- User registration, login and JWT-protected endpoints
- Per-user ownership checks for company and job-offer records
- Request validation using Zod
- Integration tests against a real PostgreSQL database with Vitest
- Local PostgreSQL development with Docker

## API overview

| Area | Endpoints |
| --- | --- |
| Users | `POST /api/register`, `POST /api/login`, `GET /api/me` |
| Companies | `POST /api/companies`, `GET /api/companies`, `GET /api/companies/:id`, `PATCH /api/companies/:id` |
| Offers | `POST /api/offers`, `GET /api/offers`, `GET /api/offers/:id`, `PATCH /api/offers/:id` |

Protected endpoints require a bearer token. Authentication and data-ownership behavior are exercised in integration tests.

## Local development

Requirements: Node.js, npm, Docker with Docker Compose, and Make.

The backend project is in **`backend/`**. Run the commands from that directory:

```bash
cd backend
cp .env.example .env
# Set a random JWT_SECRET in .env
npm ci
make db
make migrate
make generate
make dev
```

The API runs at `http://localhost:3000`. PostgreSQL runs in Docker.

### Tests

Use a separate test database. Never point `DATABASE_URL_TEST` to a database with data you need to keep.

```bash
# from backend/, with PostgreSQL running:
docker compose exec postgres createdb -U user app_db_test
make migrate-test
npm test
npm run typecheck
npm run build
```

If the test database already exists, skip its creation.

## Design decisions and lessons

The API is structured into user, company and offer modules, with routes, schemas, controllers, services and tests. Resource ownership is derived from the authenticated user rather than trusted from client-supplied IDs.

This prototype reinforced the value of validating inputs, isolating user data, and testing complete API workflows rather than testing handlers only.

## Current limitations / next steps

- Frontend application still to be built
- No deletion, pagination, email verification or password reset
- Concurrent duplicate registrations may return a generic database error
- No production deployment or CI pipeline documented
- Before a public launch: review authentication, error handling, security and operational readiness

This repository is intended as an honest demonstration of backend implementation, not a finished commercial product.
