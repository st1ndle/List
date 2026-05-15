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
const knexLib = require('knex');
const knexConfig = require('../knexfile');

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

// Инициализация Knex
const knex = knexLib(knexConfig);

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

/**
 * Запускает миграции базы данных.
 * Проверяет текущую версию и применяет только недостающие файлы.
 */
async function runMigrations() {
  console.log('[migrations] Checking for database updates...');
  try {
    const [batchNo, log] = await knex.migrate.latest();
    if (log.length === 0) {
      console.log('[migrations] Database is up to date.');
    } else {
      console.log(`[migrations] Successfully applied batch ${batchNo}. Migrations:`);
      log.forEach(file => console.log(`  - ${file}`));
    }
  } catch (error) {
    console.error('[migrations] Error during migration:', error);
    throw error;
  }
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

  // Запускаем миграции вместо ручного создания схем
  await runMigrations();

  console.log(
    `[startup] MSSQL connection OK and all migrations applied: ${dbConfig.server}:${dbConfig.port} / ${dbConfig.database}`
  );
}

module.exports = { dbConfig, getPool, verifyDatabaseStartup, knex };
