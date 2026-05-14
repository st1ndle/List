/**
 * server/config/db.js — Подключение к базе данных MSSQL.
 *
 * Здесь хранится конфигурация подключения и единственный экземпляр
 * пула соединений (connection pool). Пул создаётся один раз при первом
 * обращении и переиспользуется всеми роутами приложения.
 *
 * Что такое пул соединений?
 *   Вместо того чтобы открывать новое соединение с БД при каждом запросе
 *   (что медленно), пул держит несколько готовых соединений и выдаёт их
 *   по мере необходимости. Это значительно ускоряет работу сервера.
 */

const sql = require('mssql'); // Библиотека для работы с Microsoft SQL Server

/**
 * Объект конфигурации подключения к MSSQL.
 * Значения берутся из переменных окружения (.env файл),
 * а если переменная не задана — используется значение по умолчанию.
 *
 * Экспортируется, потому что также используется в app.js при
 * настройке сессионного хранилища (MSSQLStore хранит сессии в БД).
 */
const dbConfig = {
  user:     process.env.DB_USER     || 'sa',               // Имя пользователя MSSQL
  password: process.env.DB_PASSWORD || 'StrongP@ssw0rd!',  // Пароль
  server:   process.env.DB_HOST     || 'localhost',         // Хост сервера БД
  port:     Number(process.env.DB_PORT || 1433),            // Стандартный порт MSSQL: 1433
  database: process.env.DB_NAME     || 'master',            // Имя базы данных
  options: {
    // encrypt: true нужен при подключении к Azure SQL (облако);
    // для локального MSSQL обычно false
    encrypt:               process.env.DB_ENCRYPT === 'true',
    // Доверять самоподписанному сертификату сервера (нужно для локальной разработки)
    trustServerCertificate: true,
  },
};

// Переменная для хранения пула соединений (singleton-паттерн)
let pool;

/**
 * Возвращает единственный экземпляр пула соединений с MSSQL.
 *
 * При первом вызове создаёт пул (асинхронное подключение к БД).
 * При последующих вызовах возвращает уже существующий пул без переподключения.
 *
 * Пример использования в роуте:
 *   const p = await getPool();
 *   const result = await p.request().query('SELECT * FROM users');
 *
 * @returns {Promise<sql.ConnectionPool>} Готовый пул соединений
 */
async function getPool() {
  if (pool) return pool;           // Пул уже создан — просто возвращаем его
  pool = await sql.connect(dbConfig); // Первое подключение: создаём пул
  return pool;
}

async function ensureSiteSettingsSchema() {
  const currentPool = await getPool();

  await currentPool.request().batch(`
    IF OBJECT_ID('dbo.site_settings', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.site_settings (
        [key] NVARCHAR(100) NOT NULL PRIMARY KEY,
        [value] NVARCHAR(255) NOT NULL,
        [label] NVARCHAR(255) NULL,
        [updated_at] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;

    MERGE dbo.site_settings AS target
    USING (VALUES
      (N'stat_year', N'1998', N'Год основания'),
      (N'stat_employees', N'150', N'Сотрудников'),
      (N'stat_addresses', N'2000+', N'Адресов доставки в день'),
      (N'stat_daily_cargo', N'500т', N'Грузов в сутки'),
      (N'stat_pallets', N'17К', N'Паллетомест'),
      (N'stat_transport', N'120', N'Единиц транспорта'),
      (N'stat_warehouse_class', N'А', N'Класс склада')
    ) AS source([key], [value], [label])
    ON target.[key] = source.[key]
    WHEN NOT MATCHED THEN
      INSERT ([key], [value], [label], [updated_at])
      VALUES (source.[key], source.[value], source.[label], SYSUTCDATETIME());
  `);
}

async function verifyDatabaseStartup() {
  console.log(
    `[startup] Checking MSSQL connection to ${dbConfig.server}:${dbConfig.port} (database: ${dbConfig.database})...`
  );

  const currentPool = await getPool();
  const result = await currentPool.request().query('SELECT 1 AS ok');

  if (result.recordset?.[0]?.ok !== 1) {
    throw new Error('MSSQL connection check returned an unexpected result.');
  }

  await ensureSiteSettingsSchema();
  console.log(
    `[startup] MSSQL connection OK and required schema is ready: ${dbConfig.server}:${dbConfig.port} / ${dbConfig.database}`
  );
}

module.exports = { dbConfig, getPool, ensureSiteSettingsSchema, verifyDatabaseStartup };
