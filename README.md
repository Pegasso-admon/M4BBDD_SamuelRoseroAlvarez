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

### Tables Structure
- **customers**: Customer information
- **invoices**: Invoice data with payment tracking
- **transactions**: Individual payment transactions

### Relational Model 

## Normalization process explanation

## Advanced Query Explanations

### 1. Total Paid by Each Customer
This query aggregates all completed transactions per customer, providing insights into customer value and payment behavior.

### 2. Pending Invoices Report
Identifies overdue or partially paid invoices with customer contact information for follow-up actions.

### 3. Transactions by Platform
Analyzes payment method preferences and platform performance, supporting business intelligence decisions.


## Developer Information

- **Name**: Samuel Rosero Alvarez
- **Clan**: Berners Lee
- **Email**: p3g455o48@gmail.com
- **Project**: ExpertSoft Management System - Module 4 Performance Test