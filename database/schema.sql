-- ============================================================
-- Bookstore POS System — MySQL Schema
-- OWNER: Person 5 — Reports & Database
-- Import this into MySQL Workbench to create the real database
-- for the presentation machine. It matches the Django models
-- 1:1 (accounts, catalog, sales, inventory apps).
--
-- Usage:
--   mysql -u root -p < schema.sql
-- Then point Django at it: set USE_MYSQL=1 and the DB_* env vars
-- (see backend/README.md) and run `python manage.py migrate`
-- instead of running this file directly — Django will create the
-- exact same tables via migrations. This file is provided so the
-- team can also open/inspect/present the schema directly in
-- MySQL Workbench's ER Diagram tool, per the Iteration 1
-- deliverable ("MySQL Workbench ER diagram").
-- ============================================================

CREATE DATABASE IF NOT EXISTS bookstore_pos CHARACTER SET utf8mb4;
USE bookstore_pos;

-- ---------- accounts (Person 1) ----------
CREATE TABLE IF NOT EXISTS accounts_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    email VARCHAR(254),
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role ENUM('CASHIER','INVENTORY_STAFF','STORE_MANAGER','ADMIN') NOT NULL DEFAULT 'CASHIER',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined DATETIME NOT NULL,
    last_login DATETIME NULL
);

-- ---------- catalog (Person 2) ----------
CREATE TABLE IF NOT EXISTS catalog_book (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    INDEX idx_title (title)
);

-- ---------- inventory (Person 4) ----------
CREATE TABLE IF NOT EXISTS inventory_stockentry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL UNIQUE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    reorder_threshold INT NOT NULL DEFAULT 5,
    last_updated DATETIME NOT NULL,
    FOREIGN KEY (book_id) REFERENCES catalog_book(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_lowstockalert (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (book_id) REFERENCES catalog_book(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_stockadjustmentlog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    changed_by_id INT NULL,
    delta INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (book_id) REFERENCES catalog_book(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);

-- ---------- sales (Person 3) ----------
CREATE TABLE IF NOT EXISTS sales_sale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cashier_id INT NOT NULL,
    date_time DATETIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method ENUM('CASH','CARD') NOT NULL DEFAULT 'CASH',
    status ENUM('COMPLETED','VOIDED') NOT NULL DEFAULT 'COMPLETED',
    voided_by_id INT NULL,
    FOREIGN KEY (cashier_id) REFERENCES accounts_user(id),
    FOREIGN KEY (voided_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales_salelineitem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales_sale(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES catalog_book(id)
);

CREATE TABLE IF NOT EXISTS sales_return (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    date_time DATETIME NOT NULL,
    reason VARCHAR(255) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    processed_by_id INT NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales_sale(id),
    FOREIGN KEY (processed_by_id) REFERENCES accounts_user(id)
);

CREATE TABLE IF NOT EXISTS sales_returnlineitem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ret_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    refund_line_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ret_id) REFERENCES sales_return(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES catalog_book(id)
);

CREATE TABLE IF NOT EXISTS sales_auditlogentry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    performed_by_id INT NULL,
    timestamp DATETIME NOT NULL,
    detail TEXT,
    FOREIGN KEY (performed_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);
