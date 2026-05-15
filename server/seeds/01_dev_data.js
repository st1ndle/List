const fs = require('fs');
const path = require('path');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('[seeds] Running developer data seed...');

  // 1. Путь к оригинальному sql/seed.sql (на уровень выше от папки server)
  const seedSqlPath = path.join(__dirname, '../../sql/seed.sql');
  const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

  // 2. Выполняем основной SQL сид
  await knex.raw(seedSql);

  // 3. Дополнительно наполняем настройки сайта (так как в seed.sql их нет, только очистка)
  await knex.raw(`
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

  console.log('[seeds] Developer data applied successfully.');
};
