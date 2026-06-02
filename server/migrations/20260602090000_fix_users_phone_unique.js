/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Выполняем динамический T-SQL для поиска и удаления существующего ограничения UNIQUE или уникального индекса на колонке phone
  await knex.raw(`
    -- 1. Поиск и удаление UNIQUE Constraint (если есть)
    DECLARE @ConstraintName NVARCHAR(255);
    SELECT @ConstraintName = kc.name
    FROM sys.key_constraints kc
    INNER JOIN sys.indexes i ON kc.parent_object_id = i.object_id AND kc.unique_index_id = i.index_id
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID('dbo.users') 
      AND c.name = 'phone';

    IF @ConstraintName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.users DROP CONSTRAINT [' + @ConstraintName + ']');
        PRINT 'Dropped unique constraint: ' + @ConstraintName;
    END

    -- 2. Поиск и удаление уникального индекса (если есть и не является частью constraint)
    DECLARE @IndexName NVARCHAR(255);
    SELECT @IndexName = i.name
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('dbo.users')
      AND c.name = 'phone'
      AND i.is_unique = 1
      AND i.name NOT IN (SELECT name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('dbo.users'));

    IF @IndexName IS NOT NULL
    BEGIN
        EXEC('DROP INDEX [' + @IndexName + '] ON dbo.users');
        PRINT 'Dropped unique index: ' + @IndexName;
    END

    -- 3. Создание отфильтрованного уникального индекса (пропускает NULL значения)
    CREATE UNIQUE NONCLUSTERED INDEX UX_Users_Phone_Unique_NonNull 
    ON dbo.users(phone) 
    WHERE phone IS NOT NULL;
    PRINT 'Created filtered unique index UX_Users_Phone_Unique_NonNull';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Откат: удаляем отфильтрованный индекс и возвращаем стандартный UNIQUE
  await knex.raw(`
    IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.users') AND name = 'UX_Users_Phone_Unique_NonNull')
    BEGIN
        DROP INDEX UX_Users_Phone_Unique_NonNull ON dbo.users;
    END

    -- Возвращаем ограничение уникальности обратно
    ALTER TABLE dbo.users ADD CONSTRAINT UQ_Users_Phone UNIQUE (phone);
  `);
};
