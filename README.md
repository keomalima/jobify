# Jobify

A personal job application tracker built to practice fullstack development. The backend lets users register, log in, save companies, and track job offers. The frontend is still to come.

Built with TypeScript, Fastify, Zod, Prisma, PostgreSQL, and Vitest.

## Local setup

You need Node.js and npm, Docker with Docker Compose, and Make. Run the commands from the project root.

1. Copy the environment template (keep your existing `.env` if you already have one):

   ```bash
   cp .env.example .env
   ```

2. Generate a secret and paste it into `JWT_SECRET` in `.env`:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Install dependencies, start PostgreSQL, and prepare the database:

   ```bash
   npm ci
   make db
   make migrate
   make generate
   ```

4. Start the backend:

   ```bash
   make dev
   ```

The API runs at `http://localhost:3000`. PostgreSQL runs in Docker; the backend runs locally. The example database URLs match the local Docker configuration.

Restart the backend after editing `.env`: the development watcher watches source files, not environment files. Do not commit `.env`.

## Tests

Tests use a separate database and delete its records before each test. Never point `DATABASE_URL_TEST` at a database containing data you want to keep.

With PostgreSQL running, create the test database once:

```bash
docker compose exec postgres createdb -U user app_db_test
```

If it already exists, skip that command. Apply migrations and run the tests:

```bash
make migrate-test
npm test
```

The integration tests exercise the API and a real database. Test files run sequentially so their cleanup does not interfere. The complete workflow test registers and logs in through the API, then creates and updates records using the returned token.

Run just the workflow test:

```bash
npm test -- src/test/user-flow.test.ts
```

After changing the Prisma schema, run `make migrate`, `make generate`, and `make migrate-test` before testing.

## API

| Method | URL | Purpose |
| --- | --- | --- |
| POST | `/api/register` | Register a user |
| POST | `/api/login` | Log in and receive a token |
| GET | `/api/me` | Get the logged-in user's profile |
| POST | `/api/companies` | Create a company |
| GET | `/api/companies/` | List your companies |
| GET | `/api/companies/:id` | Get one of your companies |
| PATCH | `/api/companies/:id` | Update one of your companies |
| POST | `/api/offers` | Create an offer |
| GET | `/api/offers/` | List your offers |
| GET | `/api/offers/:id` | Get one of your offers |
| PATCH | `/api/offers/:id` | Update an offer |

The profile, company, and offer endpoints require `Authorization: Bearer <token>`. Tokens expire after one hour. Ownership comes from the token, so creation requests do not need `createdBy`. The profile returns `id`, `email`, `name`, and `surname`, without password or salt.

Create a company with `name` and `location`. Create an offer with `title` and the company's UUID as `companyId`; its status defaults to `WISHLIST`. Optional offer details include `type`, `skills`, and `salary`.

For updates, omitted fields stay unchanged. Send `null` to clear nullable details. An empty PATCH body is rejected. Lists return `[]` when there are no records.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Compile into `dist/` |
| `npm start` | Run the compiled backend after building |
| `make studio` | Browse the development database |
| `make logs` | View PostgreSQL logs |
| `make stop` | Stop PostgreSQL |
| `make down` | Remove the database container while keeping its data volume |

## Project structure

- `src/modules/`: user, company, and offer routes, schemas, controllers, services, and tests.
- `src/plugins/`: database connection and password hashing.
- `src/test/`: shared test helpers and the complete workflow test.
- `prisma/`: database schema and migrations.

## Current scope

This is a learning project. Deletion, pagination, email verification, and password reset are not implemented yet. Duplicate registration returns `409`, which reveals whether an email is registered. Concurrent registration requests can still hit the database uniqueness constraint and return a generic error.

## Frontend readiness

The backend supports the first frontend workflow: register, log in, load a profile, list companies and offers, create records, and edit them.

- [x] Protect the current-user endpoint and align its response with the User model.
- [x] Enforce ownership when reading and updating companies and offers.
- [x] Test company updates, optional fields, validation, and authentication.
- [x] Await service calls so their failures reach the controllers' error handlers.
- [x] Pass typechecking, build, and the existing integration suite during the latest review.
- [x] Test the profile endpoint in `src/modules/user/user.test.ts` with a real login token, missing/invalid/expired tokens, a deleted user, and assertions that password and salt are absent.
- [ ] Configure the frontend's development proxy for `/api` and handle expired sessions by returning to login.

For a Vite frontend, its built-in development proxy can forward `/api` to `http://localhost:3000`; no additional Nginx server is needed locally. Deployment will need its own routing configuration, or backend CORS if frontend and API use different origins.

Keep running `npm run typecheck`, `npm run build`, and `npm test` as the project changes. Pagination, deletion, CI, and email verification can follow as needed.
