# Запуск проекта (Windows + PowerShell)

## Где выполнять команды
1. Открой PowerShell.
2. Перейди в папку проекта:

```powershell
cd C:\Users\aleksandr\Desktop\LIST
```

## 1) Запустить БД в Docker

### 1.1 Поднять MSSQL-контейнер в фоне
```powershell
docker compose up -d mssql
```

### 1.2 Выполнить инициализацию БД (init.sql + seed.sql)
```powershell
docker compose up mssql-init
```

### 1.3 Проверить, что контейнер базы работает
```powershell
docker ps
```
В списке должен быть контейнер `list-mssql` в статусе `Up`.

## 2) Запусти сервер

Открой **вторую вкладку PowerShell** и выполни:

```powershell
cd C:\Users\aleksandr\Desktop\LIST
npm install
npm run start
```

Если сервер запустился успешно, увидишь строку:
`Server running on http://localhost:3000`

## 3) Запусти сайт

Открой браузер и перейди по адресу:

```text
http://localhost:3000
```

## Полезно: как останавливать

### Остановить сервер
Вкладка, где запущен `npm run start`:
`Ctrl + C`

### Остановить БД
В любой вкладке PowerShell:

```powershell
cd C:\Users\aleksandr\Desktop\LIST
docker compose down
```
