-- Database: pd_samuelrosero_bernerslee 
-- DDL Script for ExpertSoft Management System
CREATE DATABASE pd_samuelrosero_bernerslee;

USE pd_samuelrosero_bernerslee;

-- Create customers table
CREATE TABLE customers (
   customer_id INT PRIMARY KEY AUTO_INCREMENT,
   customer_name VARCHAR(100) NOT NULL,
   email VARCHAR(100) UNIQUE,
   phone VARCHAR(20),
   address VARCHAR(200)
);

-- Create invoices table
CREATE TABLE invoices (
   invoice_id INT PRIMARY KEY AUTO_INCREMENT,
   customer_id INT NOT NULL,
   invoiced_amount DECIMAL(10, 2) NOT NULL,
   paid_amount DECIMAL(10, 2) DEFAULT 0.00,
   status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
   billing_period DATE NOT NULL,
   FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

Create transactions table CREATE TABLE transactions (
   transaction_id INT PRIMARY KEY AUTO_INCREMENT,
   invoice_id INT NOT NULL,
   platform_name VARCHAR(100) NOT NULL,
   amount INT NOT NULL,
   transaction_datetime DATETIME NOT NULL,
   status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
   FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

Create indexes for better performance CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);

CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_transactions_invoice ON transactions(invoice_id);

CREATE INDEX idx_transactions_date ON transactions(transaction_date);

CREATE INDEX idx_transactions_status ON transactions(status);