const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');
const { spawn } = require('child_process'); 
// --- WHATSAPP AUTOMATION SERVICE ---
const { sendStockAlert } = require('./whatsappService'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "msi_smart_secret_key";

// --- MIDDLEWARES PROTOCOL ---
app.use(cors());
app.use(express.json());
// Exposing the asset vault for hardware visualizations
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE HANDSHAKE (PostgreSQL) ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// --- MULTER ASSET MANAGEMENT ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Auto-initialize the uploads repository if not present
if (!fs.existsSync('./uploads')){ 
    fs.mkdirSync('./uploads'); 
}

// --- PERSONNEL AUTHENTICATION HANDLERS ---

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', 
            [name, email, hashedPassword, role || 'customer']
        );
        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) { 
        res.status(500).json({ error: "Registration sequence failed: Identity conflict detected." }); 
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: "Unauthorized: Personnel profile not found." });

        const isMatch = await bcrypt.compare(password, result.rows[0].password);
        if (!isMatch) return res.status(400).json({ error: "Authentication failed: Key mismatch." });

        const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ 
            success: true, 
            token, 
            user: { id: result.rows[0].id, name: result.rows[0].name, role: result.rows[0].role } 
        });
    } catch (err) { res.status(500).json({ error: "Core System Malfunction" }); }
});

// --- PERSONNEL MANAGEMENT PROTOCOLS (ADMIN ONLY) ---

/**
 * FETCH ALL USERS
 * Retrieves the complete personnel registry for administrative review.
 */
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch personnel registry." });
    }
});

/**
 * UPDATE USER IDENTITY
 * Modifies specific personnel data (Name, Email, Role) based on ID.
 */
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
            [name, email, role, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Registry update sequence failed." });
    }
});

/**
 * TERMINATE USER ACCESS
 * Permanently removes a personnel profile from the registry.
 */
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Termination failed: User might be linked to active orders." });
    }
});

// --- INTELLIGENCE & ANALYTICS ENDPOINTS ---

app.get('/api/admin-stats', async (req, res) => {
    try {
        const p = await pool.query('SELECT COUNT(*) FROM products');
        const o = await pool.query('SELECT COUNT(*) FROM orders');
        const r = await pool.query('SELECT SUM(total_amount) FROM orders');
        const l = await pool.query('SELECT COUNT(*) FROM products WHERE stock_quantity <= min_stock_level');
        res.json({ 
            products: parseInt(p.rows[0].count), 
            orders: parseInt(o.rows[0].count), 
            revenue: parseFloat(r.rows[0].sum || 0), 
            lowStock: parseInt(l.rows[0].count) 
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sales-stats', async (req, res) => {
    try {
        const query = `
            SELECT TO_CHAR(order_date, 'Mon') as month, SUM(total_amount) as revenue 
            FROM orders 
            GROUP BY month, date_trunc('month', order_date) 
            ORDER BY date_trunc('month', order_date) ASC`;
        const result = await pool.query(query);
        let salesData = result.rows.map(row => ({ ...row, revenue: parseFloat(row.revenue), isForecast: false }));

        const scriptPath = path.join(__dirname, '../data_gen/forecast_model.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let pythonData = "";
        pythonProcess.stdout.on('data', (data) => { pythonData += data.toString(); });

        pythonProcess.on('close', () => {
            try {
                const aiResult = JSON.parse(pythonData.replace(/'/g, '"'));
                salesData.push({
                    month: "NEXT (AI)", 
                    revenue: parseFloat(aiResult.next_month_prediction || 0),
                    isForecast: true   
                });
                res.json(salesData);
            } catch (e) {
                res.json(salesData);
            }
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- AI INTELLIGENCE HANDLER ---

app.get('/api/ai-forecast', async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '../data_gen/forecast_model.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let pythonData = "";
        pythonProcess.stdout.on('data', (data) => { pythonData += data.toString(); });

        pythonProcess.on('close', (code) => {
            try {
                const aiResult = JSON.parse(pythonData.replace(/'/g, '"'));
                res.json(aiResult);
            } catch (e) {
                res.status(500).json({ error: "ML Engine sync failed." });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Intelligence Matrix inaccessible." });
    }
});

// --- CRITICAL STOCK ALERTS ---
app.get('/api/inventory/alerts', async (req, res) => {
    try {
        const query = `
            SELECT id, name, stock_quantity, min_stock_level, image_url 
            FROM products 
            WHERE stock_quantity <= min_stock_level
            ORDER BY stock_quantity ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Intelligence stream interrupted." });
    }
});

// --- PERSONNEL WISHLIST PROTOCOLS ---

app.get('/api/wishlist/:user_id', async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.name, p.price, p.image_url, p.stock_quantity 
            FROM products p
            JOIN wishlist w ON p.id = w.product_id
            WHERE w.user_id = $1`;
        const result = await pool.query(query, [req.params.user_id]);
        res.json(result.rows || []); 
    } catch (err) { 
        res.status(500).json({ error: "Could not sync wishlist data stream." }); 
    }
});

app.post('/api/wishlist', async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user_id, product_id]);
        res.json({ success: true, message: "Hardware synced to wishlist archive." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/wishlist/:user_id/:product_id', async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.params.user_id, req.params.product_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PERSONNEL TRANSACTION TRACKING ---

app.get('/api/user-orders/:user_id', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.order_date, o.total_amount, o.status, 
                    JSON_AGG(JSON_BUILD_OBJECT('name', p.name, 'qty', oi.quantity)) as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.order_date DESC`;
        const result = await pool.query(query, [req.params.user_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SPECIAL FILTER: RECENT DEPLOYMENTS ---

app.get('/api/products/new', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- INVENTORY LIFECYCLE MANAGEMENT ---

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    const { name, price, stock_quantity, min_stock_level, description } = req.body;
    const image_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
    try {
        await pool.query(
            'INSERT INTO products (name, price, stock_quantity, min_stock_level, description, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6, 1)', 
            [name, price, stock_quantity, min_stock_level, description, image_url]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Inventory insertion failure." }); }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, price, stock_quantity, min_stock_level } = req.body;
    try {
        if (req.file) {
            const image_url = `http://localhost:5000/uploads/${req.file.filename}`;
            await pool.query('UPDATE products SET name=$1, price=$2, stock_quantity=$3, min_stock_level=$4, image_url=$5 WHERE id=$6', [name, price, stock_quantity, min_stock_level, image_url, id]);
        } else {
            await pool.query('UPDATE products SET name=$1, price=$2, stock_quantity=$3, min_stock_level=$4 WHERE id=$5', [name, price, stock_quantity, min_stock_level, id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Update sequence aborted." }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Constraint violation: Asset linked to transaction logs." }); }
});

// --- CHECKOUT TRANSACTION PROTOCOL ---

app.post('/api/checkout', async (req, res) => {
    const { product_id, quantity, user_id, price } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Atomic transaction start
        const orderRes = await client.query('INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id', [user_id || 1, price * quantity, 'Processing']);
        await client.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [orderRes.rows[0].id, product_id, quantity, price]);
        
        // Updating product stock levels
        await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, product_id]);
        
        // --- REAL-TIME STOCK ANALYSIS FOR WHATSAPP ALERT ---
        const stockCheck = await client.query('SELECT name, stock_quantity FROM products WHERE id = $1', [product_id]);
        const product = stockCheck.rows[0];

        // Trigger WhatsApp alert if stock falls below critical threshold (10 units)
        if (product.stock_quantity < 10) {
            await sendStockAlert(product.name, product.stock_quantity); 
        }

        await client.query('COMMIT'); // Data commitment
        res.json({ success: true });
    } catch (e) { 
        await client.query('ROLLBACK'); 
        res.status(500).json({ error: "Checkout Error: " + e.message }); 
    } finally { 
        client.release(); 
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.order_date, o.total_amount, o.status, u.name as customer_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.order_date DESC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CORE SYSTEM INITIALIZATION ---
app.listen(port, () => {
    console.log(`[OK] MSI CORE: Backend active on port ${port}`);
});
