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
    price DECIMAL(10, 2) NOT NULL,
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

-- Таблица заказов
CREATE TABLE orders (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_number INT IDENTITY(1000, 1) UNIQUE NOT NULL, -- Человекочитаемый номер заказа (автоинкремент, начинается с 1000)
    user_id UNIQUEIDENTIFIER NULL, -- Привязка к пользователю (NULL если можно заказывать без регистрации)
    status NVARCHAR(50) NOT NULL DEFAULT 'new', -- Статус: new, processing, completed, cancelled
    total_amount DECIMAL(10, 2) NOT NULL, -- Общая сумма заказа
    customer_name NVARCHAR(100) NOT NULL, -- Имя заказчика
    customer_phone NVARCHAR(20) NOT NULL, -- Контактный телефон
    delivery_address NVARCHAR(MAX), -- Адрес доставки (можно NULL, если самовывоз)
    comment NVARCHAR(MAX), -- Комментарий к заказу
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT CHK_Orders_Status CHECK (status IN ('new', 'processing', 'completed', 'cancelled'))
);

CREATE INDEX IX_Orders_UserId ON orders(user_id);
CREATE INDEX IX_Orders_OrderNumber ON orders(order_number);

-- Таблица позиций заказа (какие продукты и сколько)
CREATE TABLE order_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_id UNIQUEIDENTIFIER NOT NULL,
    product_id VARCHAR(36) NOT NULL, -- Обрати внимание, в таблице products id имеет тип VARCHAR(36)
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- Фиксируем цену товара на момент покупки (если цена в каталоге изменится, в чеке останется старая)
    
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION,
    CONSTRAINT CHK_OrderItems_Quantity CHECK (quantity > 0)
);

CREATE INDEX IX_OrderItems_OrderId ON order_items(order_id);
