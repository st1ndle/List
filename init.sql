-- Таблица категорий
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    color_hex VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BIT DEFAULT 1
);

-- Таблица товаров (напитков)
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    brand NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price FLOAT NOT NULL,
    unit_name NVARCHAR(50) NOT NULL,
    emoji NVARCHAR(50),
    badge NVARCHAR(50),
    bg_color VARCHAR(50),
    attributes NVARCHAR(MAX),
    stock_quantity INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT CHK_Products_Attributes_JSON CHECK (attributes IS NULL OR ISJSON(attributes) = 1)
);

CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100),
    phone NVARCHAR(20) UNIQUE,
    email NVARCHAR(255) UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    CONSTRAINT CHK_Users_Role CHECK (role IN ('user', 'admin'))
);

CREATE INDEX IX_Users_Phone ON users(phone);

-- Таблица сессий для connect-mssql-v2
CREATE TABLE [sessions] (
    [sid] VARCHAR(255) NOT NULL PRIMARY KEY,
    [session] VARCHAR(MAX) NOT NULL,
    [expires] DATETIME NOT NULL
);

