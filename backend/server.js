const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tu_contraseña',
    database: process.env.DB_NAME || 'pd_samuelrosero_bernerslee',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

// CUSTOMERS CRUD ENDPOINTS

// GET all customers
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET customer by ID
app.get('/api/customers/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create customer
app.post('/api/customers', async (req, res) => {
    try {
        const { customer_name, email, phone, address, city, registration_date } = req.body;
        
        // Validation
        if (!customer_name || !registration_date) {
            return res.status(400).json({ success: false, error: 'Name and registration date are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO customers (customer_name, email, phone, address, city, registration_date) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_name, email, phone, address, city, registration_date]
        );

        res.status(201).json({ 
            success: true, 
            data: { customer_id: result.insertId, customer_name, email, phone, address, city, registration_date }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, error: 'Email already exists' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// PUT update customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const { customer_name, email, phone, address, city, status } = req.body;
        const customerId = req.params.id;

        const [result] = await pool.execute(
            'UPDATE customers SET customer_name = ?, email = ?, phone = ?, address = ?, city = ?, status = ? WHERE customer_id = ?',
            [customer_name, email, phone, address, city, status, customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, error: 'Email already exists' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// DELETE customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ADVANCED QUERIES

// 1. Total paid by each customer
app.get('/api/reports/customer-payments', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.customer_id,
                c.customer_name,
                c.email,
                COALESCE(SUM(i.paid_amount), 0) as total_paid,
                COUNT(i.invoice_id) as total_invoices
            FROM customers c
            LEFT JOIN invoices i ON c.customer_id = i.customer_id
            GROUP BY c.customer_id, c.customer_name, c.email
            ORDER BY total_paid DESC
        `;
        
        const [rows] = await pool.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Pending invoices with customer and transaction info
app.get('/api/reports/pending-invoices', async (req, res) => {
    try {
        const query = `
            SELECT 
                i.invoice_id,
                i.invoice_number,
                i.total_amount,
                i.paid_amount,
                (i.total_amount - i.paid_amount) as pending_amount,
                i.due_date,
                c.customer_name,
                c.email,
                c.phone,
                GROUP_CONCAT(
                    CONCAT(p.platform_name, ': $', t.amount) 
                    ORDER BY t.transaction_date DESC 
                    SEPARATOR '; '
                ) as recent_transactions
            FROM invoices i
            INNER JOIN customers c ON i.customer_id = c.customer_id
            LEFT JOIN transactions t ON i.invoice_id = t.invoice_id AND t.status = 'completed'
            LEFT JOIN platforms p ON t.platform_id = p.platform_id
            WHERE i.status IN ('pending', 'partial', 'overdue')
            GROUP BY i.invoice_id, i.invoice_number, i.total_amount, i.paid_amount, 
                    i.due_date, c.customer_name, c.email, c.phone
            ORDER BY i.due_date ASC
        `;
        
        const [rows] = await pool.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Transactions by platform
app.get('/api/reports/transactions-by-platform', async (req, res) => {
    try {
        const { platform } = req.query;
        let query = `
            SELECT 
                t.transaction_id,
                t.transaction_reference,
                t.amount,
                t.transaction_date,
                t.status as transaction_status,
                p.platform_name,
                c.customer_name,
                c.email,
                i.invoice_number,
                i.total_amount as invoice_total,
                t.notes
            FROM transactions t
            INNER JOIN platforms p ON t.platform_id = p.platform_id
            INNER JOIN invoices i ON t.invoice_id = i.invoice_id
            INNER JOIN customers c ON i.customer_id = c.customer_id
        `;
        
        const params = [];
        if (platform) {
            query += ' WHERE LOWER(p.platform_name) = LOWER(?)';
            params.push(platform);
        }
        
        query += ' ORDER BY t.transaction_date DESC';
        
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CSV BULK LOAD ENDPOINT
app.post('/api/bulk-load', upload.single('csvFile'), async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
        }

        await connection.beginTransaction();
        
        const results = [];
        const errors = [];
        let processedCount = 0;

        // Read and process CSV file
        const csvData = await new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (row) => data.push(row))
                .on('end', () => resolve(data))
                .on('error', reject);
        });

        for (const row of csvData) {
            try {
                // Skip empty rows
                if (!row.customer_name || !row.invoice_number) continue;

                // Insert or get customer
                let customerId;
                const [existingCustomer] = await connection.execute(
                    'SELECT customer_id FROM customers WHERE email = ?',
                    [row.email]
                );

                if (existingCustomer.length > 0) {
                    customerId = existingCustomer[0].customer_id;
                } else {
                    const [customerResult] = await connection.execute(
                        'INSERT INTO customers (customer_name, email, phone, address, city, registration_date) VALUES (?, ?, ?, ?, ?, ?)',
                        [row.customer_name, row.email, row.phone, row.address, row.city, row.registration_date]
                    );
                    customerId = customerResult.insertId;
                }

                // Insert or get invoice
                let invoiceId;
                const [existingInvoice] = await connection.execute(
                    'SELECT invoice_id FROM invoices WHERE invoice_number = ?',
                    [row.invoice_number]
                );

                if (existingInvoice.length > 0) {
                    invoiceId = existingInvoice[0].invoice_id;
                } else {
                    const [invoiceResult] = await connection.execute(
                        'INSERT INTO invoices (customer_id, invoice_number, total_amount, paid_amount, status, issue_date, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [customerId, row.invoice_number, row.total_amount, row.paid_amount, row.invoice_status, row.issue_date, row.due_date, row.description]
                    );
                    invoiceId = invoiceResult.insertId;
                }

                // Insert transaction if exists
                if (row.platform_name && row.transaction_reference && row.transaction_amount) {
                    // Get platform ID
                    const [platform] = await connection.execute(
                        'SELECT platform_id FROM platforms WHERE platform_name = ?',
                        [row.platform_name]
                    );

                    if (platform.length > 0) {
                        await connection.execute(
                            'INSERT IGNORE INTO transactions (invoice_id, platform_id, transaction_reference, amount, transaction_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [invoiceId, platform[0].platform_id, row.transaction_reference, row.transaction_amount, row.transaction_date, row.transaction_status, row.notes]
                        );
                    }
                }

                processedCount++;
                results.push({ row: processedCount, status: 'success' });

            } catch (rowError) {
                errors.push({ row: processedCount + 1, error: rowError.message });
            }
        }

        await connection.commit();

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Bulk load completed. ${processedCount} records processed.`,
            processed: processedCount,
            errors: errors.length,
            errorDetails: errors
        });

    } catch (error) {
        await connection.rollback();
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// Get all platforms (for form dropdowns)
app.get('/api/platforms', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM platforms WHERE status = "active"');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
    console.log(` Server running on http://localhost:${PORT}`);
    await testConnection();
});

module.exports = app;