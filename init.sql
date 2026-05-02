-- Включаем поддержку внешних ключей (в SQLite она по умолчанию может быть выключена)
PRAGMA foreign_keys = ON;

-- Таблица категорий
CREATE TABLE categories (
    id TEXT PRIMARY KEY,                   -- UUID строка, генерируется на бэкенде
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1            -- В SQLite нет BOOLEAN, используется 1/0
);

-- Таблица товаров (напитков)
CREATE TABLE products (
    id TEXT PRIMARY KEY,                   -- UUID строка
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,                   -- Либо INTEGER, если решите хранить цену в копейках
    unit_name TEXT NOT NULL,
    emoji TEXT,
    badge TEXT,
    bg_color TEXT,
    attributes TEXT,                       -- Здесь будет лежать JSON
    stock_quantity INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Внешний ключ
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Защита: проверяем, что в поле attributes действительно валидный JSON
    CHECK (attributes IS NULL OR json_valid(attributes) = 1)
);

-- Индекс для оптимизации
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    first_name NVARCHAR(100) NOT NULL,                -- Имя ('Иван')
    last_name NVARCHAR(100),                          -- Фамилия ('Иванов', может быть необязательной)
    phone NVARCHAR(20) NOT NULL UNIQUE,               -- Телефон используется как логин (+7...)
    password_hash NVARCHAR(255) NOT NULL,             -- Хэш пароля (Bcrypt/Argon2)
    role NVARCHAR(20) NOT NULL DEFAULT 'user',        -- Роль по умолчанию — обычный пользователь
    is_active BIT DEFAULT 1,                          -- Возможность заблокировать пользователя (1 - активен, 0 - бан)
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    -- Защита: база данных выдаст ошибку, если попытаться записать неизвестную роль
    CONSTRAINT CHK_Users_Role CHECK (role IN ('user', 'admin'))
);

-- Индекс для ускорения процесса авторизации (так как поиск идет по телефону)
CREATE INDEX IX_Users_Phone ON users(phone);
