# Переменные
DOCKER_COMPOSE = docker-compose

.PHONY: help up down restart status logs build rebuild clean db-reset

help: ## Показать справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Запустить проект в фоновом режиме
	$(DOCKER_COMPOSE) up -d

down: ## Остановить и удалить контейнеры
	$(DOCKER_COMPOSE) down

restart: ## Перезапустить все контейнеры
	$(DOCKER_COMPOSE) restart

status: ## Статус контейнеров
	$(DOCKER_COMPOSE) ps

logs: ## Посмотреть логи всех контейнеров (Ctrl+C для выхода)
	$(DOCKER_COMPOSE) logs -f

build: ## Собрать образы
	$(DOCKER_COMPOSE) build

rebuild: ## Пересобрать образы и запустить проект
	$(DOCKER_COMPOSE) up -d --build

clean: ## Полная очистка: удалить контейнеры, образы и тома
	$(DOCKER_COMPOSE) down -v --rmi all

db-reset: ## Полный сброс базы данных (удаление томов и повторная инициализация)
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d
	@echo "База данных сброшена и пересоздана."

backend-logs: ## Логи только бэкенда
	$(DOCKER_COMPOSE) logs -f backend

frontend-logs: ## Логи только фронтенда
	$(DOCKER_COMPOSE) logs -f frontend

db-logs: ## Логи базы данных
	$(DOCKER_COMPOSE) logs -f mssql
