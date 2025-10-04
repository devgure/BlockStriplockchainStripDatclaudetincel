PHONY: help install-all dev prod build test clean

help:
	@echo "Etincel Development Commands"
	@echo "============================"
	@echo "make install-all  - Install all dependencies"
	@echo "make dev          - Start development environment"
	@echo "make prod         - Start production environment"
	@echo "make build        - Build all services"
	@echo "make test         - Run all tests"
	@echo "make clean        - Clean all containers and volumes"

install-all:
	@echo "Installing dependencies..."
	npm install
	cd services/auth-service && npm install
	cd services/profile-service && npm install
	cd services/match-service && npm install
	cd services/chat-service && npm install
	cd services/payment-service && npm install
	cd services/ai-service && pip install -r requirements.txt
	cd client/mobile-native && npm install
	cd client/mobile-web && npm install
	cd client/desktop-web && npm install
	cd admin-dashboard && npm install
	@echo "✅ All dependencies installed"

dev:
	docker-compose -f docker-compose.dev.yml up --build

prod:
	docker-compose up -d --build

build:
	npm run build:all

test:
	npm run test

db:migrate:
	npx prisma migrate dev

db:seed:
	npm run db:seed

k8s:deploy:
	kubectl apply -f infra/k8s/

clean:
	docker-compose down -v
	docker system prune -af