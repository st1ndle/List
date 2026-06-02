const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Проверяем наличие пользователя с ролью 'admin'
  const admins = await knex('users').where({ role: 'admin' }).count({ count: '*' });
  const adminCount = parseInt(admins[0].count, 10);

  if (adminCount === 0) {
    console.log('[migration-seed] Admin not found. Creating default admin...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await knex('users').insert({
      first_name: 'Администратор',
      last_name: 'Системы',
      phone: null,
      email: 'admin@list.ru',
      password_hash: passwordHash,
      role: 'admin',
      is_active: 1
    });
    console.log('[migration-seed] Default admin created successfully (admin@list.ru / password123).');
  } else {
    console.log('[migration-seed] Admin already exists. Skipping default admin seeding.');
  }

  // 2. Проверяем настройки сайта
  const settingsCountRes = await knex('site_settings').count({ count: '*' });
  const settingsCount = parseInt(settingsCountRes[0].count, 10);

  if (settingsCount === 0) {
    console.log('[migration-seed] Site settings are empty. Inserting default site settings...');
    await knex('site_settings').insert([
      { key: 'stat_year', value: '1998', label: 'Год основания' },
      { key: 'stat_employees', value: '150', label: 'Сотрудников' },
      { key: 'stat_addresses', value: '2000+', label: 'Адресов доставки в день' },
      { key: 'stat_daily_cargo', value: '500т', label: 'Грузов в сутки' },
      { key: 'stat_pallets', value: '17К', label: 'Паллетомест' },
      { key: 'stat_transport', value: '120', label: 'Единиц транспорта' },
      { key: 'stat_warehouse_class', value: 'А', label: 'Класс склада' }
    ]);
    console.log('[migration-seed] Default site settings inserted successfully.');
  } else {
    console.log('[migration-seed] Site settings already exist. Skipping site settings seeding.');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(_knex) {
  // Поскольку это первоначальная инициализация данных в продакшене,
  // мы не хотим удалять данные при откате миграции во избежание случайной потери реальных данных.
  // Но для тестирования мы можем очистить только те настройки, которые мы внесли, и дефолтного админа, если они не изменились.
  console.log('[migration-seed] Rollback migration: skipping data deletion to preserve production state.');
};
