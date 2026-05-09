-- Таблица категорий
IF OBJECT_ID('dbo.categories', 'U') IS NULL
BEGIN
    CREATE TABLE categories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        slug NVARCHAR(255) NOT NULL UNIQUE,
        name NVARCHAR(255) NOT NULL,
        color_hex VARCHAR(50) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BIT DEFAULT 1
    );
END

-- Таблица товаров (напитков)
IF OBJECT_ID('dbo.products', 'U') IS NULL
BEGIN
    CREATE TABLE products (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        category_id UNIQUEIDENTIFIER NOT NULL,
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
END

-- Таблица пользователей
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
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
END

-- Таблица сессий для connect-mssql-v2
IF OBJECT_ID('dbo.sessions', 'U') IS NULL
BEGIN
    CREATE TABLE [sessions] (
        [sid] VARCHAR(255) NOT NULL PRIMARY KEY,
        [session] VARCHAR(MAX) NOT NULL,
        [expires] DATETIME NOT NULL
    );
END

-- Таблица складов
IF OBJECT_ID('dbo.warehouses', 'U') IS NULL
BEGIN
    CREATE TABLE warehouses (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        address NVARCHAR(255) NOT NULL,
        phone NVARCHAR(50),
        working_hours NVARCHAR(100),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Warehouses_IsActive ON warehouses(is_active);
END

-- Таблица заказов
IF OBJECT_ID('dbo.orders', 'U') IS NULL
BEGIN
    CREATE TABLE orders (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_number INT IDENTITY(1000, 1) UNIQUE NOT NULL,
        user_id UNIQUEIDENTIFIER NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'new',
        total_amount DECIMAL(10, 2) NOT NULL,
        customer_name NVARCHAR(100) NOT NULL,
        customer_phone NVARCHAR(20) NOT NULL,
        delivery_address NVARCHAR(MAX),
        comment NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        
        CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT CHK_Orders_Status CHECK (status IN ('new', 'processing', 'completed', 'cancelled'))
    );
    CREATE INDEX IX_Orders_UserId ON orders(user_id);
    CREATE INDEX IX_Orders_OrderNumber ON orders(order_number);
END

-- Таблица позиций заказа
IF OBJECT_ID('dbo.order_items', 'U') IS NULL
BEGIN
    CREATE TABLE order_items (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_id UNIQUEIDENTIFIER NOT NULL,
        product_id UNIQUEIDENTIFIER NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        
        CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION,
        CONSTRAINT CHK_OrderItems_Quantity CHECK (quantity > 0)
    );
    CREATE INDEX IX_OrderItems_OrderId ON order_items(order_id);
END
