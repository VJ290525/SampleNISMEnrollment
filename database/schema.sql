IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE TABLE [Exams] (
        [Id] int NOT NULL IDENTITY,
        [Code] nvarchar(30) NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Exams] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE TABLE [Profiles] (
        [Id] int NOT NULL IDENTITY,
        [Reference] nvarchar(40) NOT NULL,
        [FullName] nvarchar(120) NOT NULL,
        [Email] nvarchar(254) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Centre] nvarchar(100) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [ReviewReason] nvarchar(1000) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [Version] rowversion NOT NULL,
        CONSTRAINT [PK_Profiles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE TABLE [Sessions] (
        [Id] int NOT NULL IDENTITY,
        [ExamId] int NOT NULL,
        [Centre] nvarchar(100) NOT NULL,
        [StartsAt] datetimeoffset NOT NULL,
        [Capacity] int NOT NULL,
        [HeldSeats] int NOT NULL,
        [BookingOpen] bit NOT NULL,
        CONSTRAINT [PK_Sessions] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Session_Seats] CHECK ([Capacity] >= 0 AND [HeldSeats] >= 0 AND [HeldSeats] <= [Capacity]),
        CONSTRAINT [FK_Sessions_Exams_ExamId] FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE TABLE [Reviews] (
        [Id] bigint NOT NULL IDENTITY,
        [ProfileId] int NOT NULL,
        [PreviousStatus] nvarchar(30) NOT NULL,
        [NewStatus] nvarchar(30) NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Reviews] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Reviews_Profiles_ProfileId] FOREIGN KEY ([ProfileId]) REFERENCES [Profiles] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE TABLE [Enrollments] (
        [Id] int NOT NULL IDENTITY,
        [Reference] nvarchar(40) NOT NULL,
        [ProfileId] int NOT NULL,
        [ExamId] int NOT NULL,
        [SessionId] int NULL,
        [Centre] nvarchar(100) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Enrollments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Enrollments_Exams_ExamId] FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Enrollments_Profiles_ProfileId] FOREIGN KEY ([ProfileId]) REFERENCES [Profiles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Enrollments_Sessions_SessionId] FOREIGN KEY ([SessionId]) REFERENCES [Sessions] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Enrollments_CreatedAt] ON [Enrollments] ([CreatedAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Enrollments_ExamId] ON [Enrollments] ([ExamId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Enrollments_ProfileId_ExamId] ON [Enrollments] ([ProfileId], [ExamId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Enrollments_Reference] ON [Enrollments] ([Reference]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Enrollments_SessionId] ON [Enrollments] ([SessionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Exams_Code] ON [Exams] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Exams_Name] ON [Exams] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Profiles_Email] ON [Profiles] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Profiles_Reference] ON [Profiles] ([Reference]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reviews_ProfileId] ON [Reviews] ([ProfileId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Sessions_ExamId] ON [Sessions] ([ExamId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261015080707_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261015080707_InitialCreate', N'8.0.28');
END;
GO

COMMIT;
GO
