.DEFAULT_GOAL := dev

COMPOSE = docker compose -f docker-compose.yml
PRISMA = npx prisma --config prisma7.config.ts

.PHONY: dev db start stop restart down logs studio migrate generate \
        migrate-test test

dev: db
	npm run dev

db:
	$(COMPOSE) up -d --wait postgres

start: db

stop:
	$(COMPOSE) stop postgres

restart:
	$(COMPOSE) restart postgres

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f postgres

studio:
	$(PRISMA) studio

migrate:
	$(PRISMA) migrate dev

generate:
	$(PRISMA) generate

migrate-test:
	node --input-type=module -e 'import "dotenv/config"; import { spawnSync } from "node:child_process"; const url = process.env.DATABASE_URL_TEST; if (!url) throw new Error("DATABASE_URL_TEST is required"); const result = spawnSync("npx", ["prisma", "migrate", "deploy", "--config", "prisma7.config.ts"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } }); if (result.error) throw result.error; process.exit(result.status ?? 1);'

test:
	npm test