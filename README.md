# ExpertSoft Management System

A comprehensive financial management system designed to organize and structure financial information from ExpertSoft platforms like Nequi and Daviplata. This system transforms disorganized Excel data into a normalized SQL database with CRUD operations and advanced reporting capabilities.

## System Architecture

This system follows a normalized relational database design applying the first three normal forms (1NF, 2NF, 3NF) to ensure data integrity and eliminate redundancy.

## Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Frontend**: HTML5, Bootstrap 5, JavaScript (Vanilla)
- **File Processing**: CSV-Parser, Multer
- **API Testing**: Postman

##  Project Structure
```
m4bbdd_samuelroseroalvarez/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── uploads/ (created automatically)
│   └── node_modules/ (created automatically)
├── database/
│   └── database_ddl.sql
├── frontend/
│   ├── public/
│   │   └── index.html
├── postman/
│   └── ExpertSoft_api.postman_collection.json
├── docs/
│   ├── relational_model.png
├── data/
│   └── normalized_data_customers.csv
│   ├── normalized_data_invoices.csv
│   ├── normalized_data_transactions.csv
└── README.md
```

##  Database Normalization Process

# TO DO
- NORMALIZATION PROCESS
- RELATIONAL MODEL
- CRUD ACCORDING TO THE EXCERSICE
- FIX JAVASCRIPT-FRONTEND(HTML), MAKE IT ACCORDING TO THE EXCERCISE
- STEP BY STEP TO ADD THE POSTMAN
- ADVANCED CONSULTS STEP BY STEP
- FIX THE DDL, SQL, FILE
- FINISH THE README FILE 



### In process

### Tables Structure
- **customers**: Customer information
- **invoices**: Invoice data with payment tracking
- **transactions**: Individual payment transactions

### Relational Model in process

Screenshot

## 📱 Features in proccess

### Customer Management (CRUD)
- ✅ Create new customers with validation
- ✅ Read customer information with filtering
- ✅ Update customer details
- ✅ Delete customers (with cascade to related records)

### Advanced Reporting
1. **Customer Payment Summary**: Total payments by customer
2. **Pending Invoices Report**: Outstanding invoices with customer details
3. **Platform Transaction Analysis**: Transactions filtered by payment platform

### Bulk Data Loading
- Upload CSV files with customer, invoice, and transaction data
- Automatic data validation and processing
- Error handling and reporting

## 🔗 API Endpoints

### Customer CRUD
```http
GET    /api/customers           # Get all customers
GET    /api/customers/:id       # Get customer by ID
POST   /api/customers           # Create new customer
PUT    /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Delete customer
```

### Advanced Queries
```http
GET /api/reports/customer-payments     # Total paid by each customer
GET /api/reports/pending-invoices      # Pending invoices with details
GET /api/reports/transactions-by-platform?platform=Nequi  # Platform transactions
```

### Bulk Operations
```http
POST /api/bulk-load               # Upload CSV file for bulk processing
```

## 📋 CSV Bulk Load Instructions

### CSV Format Requirements
Your CSV file must include these columns:
```
customer_name, email, phone, address, city, registration_date,
invoice_number, total_amount, paid_amount, invoice_status,
issue_date, due_date, description, platform_name,
transaction_reference, transaction_amount, transaction_date,
transaction_status, notes
```

## 📊 Advanced Query Explanations

### 1. Total Paid by Each Customer
This query aggregates all completed transactions per customer, providing insights into customer value and payment behavior.

### 2. Pending Invoices Report
Identifies overdue or partially paid invoices with customer contact information for follow-up actions.

### 3. Transactions by Platform
Analyzes payment method preferences and platform performance, supporting business intelligence decisions.


## 👨‍💻 Developer Information

- **Name**: Samuel Rosero Alvarez
- **Clan**: Berners Lee
- **Email**: p3g455o48@gmail.com
- **Project**: ExpertSoft Management System - Module 4 Performance Test