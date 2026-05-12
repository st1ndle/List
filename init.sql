SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.order_items', N'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID(N'dbo.orders', N'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID(N'dbo.sessions', N'U') IS NOT NULL DROP TABLE dbo.sessions;
IF OBJECT_ID(N'dbo.products', N'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID(N'dbo.categories', N'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE dbo.categories (
    id VARCHAR(36) NOT NULL,
    slug NVARCHAR(64) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    color_hex CHAR(7) NOT NULL,
    sort_order INT NOT NULL CONSTRAINT DF_Categories_SortOrder DEFAULT (0),
    is_active BIT NOT NULL CONSTRAINT DF_Categories_IsActive DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Categories_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Categories PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_Categories_Slug UNIQUE (slug),
    CONSTRAINT UQ_Categories_IdSlug UNIQUE (id, slug),
    CONSTRAINT CHK_Categories_Id_Guid CHECK (TRY_CONVERT(UNIQUEIDENTIFIER, id) IS NOT NULL),
    CONSTRAINT CHK_Categories_ColorHex CHECK (color_hex LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
    CONSTRAINT CHK_Categories_SortOrder CHECK (sort_order >= 0)
);
GO

CREATE TABLE dbo.products (
    id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    category_slug NVARCHAR(64) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    brand NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit NVARCHAR(50) NOT NULL,
    emoji NVARCHAR(16) NULL,
    badge NVARCHAR(50) NULL,
    color NVARCHAR(50) NULL,
    attributes NVARCHAR(MAX) NULL,
    stock_quantity INT NOT NULL CONSTRAINT DF_Products_StockQuantity DEFAULT (0),
    is_active BIT NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Products PRIMARY KEY CLUSTERED (id),
    CONSTRAINT products_categories_fk FOREIGN KEY (category_id, category_slug)
        REFERENCES dbo.categories(id, slug)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_Products_Id_Guid CHECK (TRY_CONVERT(UNIQUEIDENTIFIER, id) IS NOT NULL),
    CONSTRAINT CHK_Products_Price CHECK (price >= 0),
    CONSTRAINT CHK_Products_StockQuantity CHECK (stock_quantity >= 0),
    CONSTRAINT CHK_Products_AttributesJson CHECK (attributes IS NULL OR ISJSON(attributes) = 1)
);
GO

CREATE INDEX IX_Products_CategoryId ON dbo.products(category_id);
CREATE INDEX IX_Products_CategorySlug ON dbo.products(category_slug);
CREATE INDEX IX_Products_IsActive_Name ON dbo.products(is_active, name);
GO

CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Users_Id DEFAULT NEWID(),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(255) NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'user',
    is_active BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CHK_Users_Contact CHECK (phone IS NOT NULL OR email IS NOT NULL),
    CONSTRAINT CHK_Users_Role CHECK (role IN (N'user', N'admin')),
    CONSTRAINT CHK_Users_Email CHECK (email IS NULL OR email LIKE N'%_@_%._%')
);
GO

CREATE UNIQUE INDEX IX_Users_Phone ON dbo.users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IX_Users_Email ON dbo.users(email) WHERE email IS NOT NULL;
GO

CREATE TABLE dbo.sessions (
    sid VARCHAR(255) NOT NULL,
    session NVARCHAR(MAX) NOT NULL,
    expires DATETIME NOT NULL,

    CONSTRAINT PK_Sessions PRIMARY KEY CLUSTERED (sid)
);
GO

CREATE INDEX IX_Sessions_Expires ON dbo.sessions(expires);
GO

CREATE TABLE dbo.orders (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Orders_Id DEFAULT NEWID(),
    order_number INT IDENTITY(1000, 1) NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT N'new',
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_name NVARCHAR(100) NOT NULL,
    customer_phone NVARCHAR(20) NOT NULL,
    delivery_address NVARCHAR(MAX) NULL,
    comment NVARCHAR(MAX) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_Orders_OrderNumber UNIQUE (order_number),
    CONSTRAINT orders_users_fk FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CHK_Orders_Status CHECK (status IN (N'new', N'processing', N'ready', N'done')),
    CONSTRAINT CHK_Orders_TotalAmount CHECK (total_amount >= 0)
);
GO

CREATE INDEX IX_Orders_UserId_CreatedAt ON dbo.orders(user_id, created_at DESC);
CREATE INDEX IX_Orders_Status ON dbo.orders(status);
GO

CREATE TABLE dbo.order_items (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_OrderItems_Id DEFAULT NEWID(),
    order_id UNIQUEIDENTIFIER NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_OrderItems_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_OrderItems PRIMARY KEY CLUSTERED (id),
    CONSTRAINT order_items_orders_fk FOREIGN KEY (order_id)
        REFERENCES dbo.orders(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT order_items_products_fk FOREIGN KEY (product_id)
        REFERENCES dbo.products(id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_OrderItems_Quantity CHECK (quantity > 0),
    CONSTRAINT CHK_OrderItems_PriceAtPurchase CHECK (price_at_purchase >= 0)
);
GO

CREATE INDEX IX_OrderItems_OrderId ON dbo.order_items(order_id);
CREATE INDEX IX_OrderItems_ProductId ON dbo.order_items(product_id);
GO
