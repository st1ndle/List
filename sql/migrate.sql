ALTER TABLE products ALTER COLUMN price DECIMAL(10, 2) NOT NULL;

-- Таблица заказов
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

-- Таблица позиций заказа
CREATE TABLE order_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_id UNIQUEIDENTIFIER NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION,
    CONSTRAINT CHK_OrderItems_Quantity CHECK (quantity > 0)
);

CREATE INDEX IX_OrderItems_OrderId ON order_items(order_id);
