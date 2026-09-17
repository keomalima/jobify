COMPOSE = docker compose -f ./docker-compose.yml

all: dev

dev: 
	$(COMPOSE) up --build -d

start:
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down

studio:
	npx prisma studio

migrate:
	$(COMPOSE) exec npx prisma migrate dev

logs:
	$(COMPOSE) logs -f backend

.PHONY: clean build start stop down studio migrate logs prod