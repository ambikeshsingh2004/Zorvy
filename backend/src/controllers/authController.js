const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
    const login = async (req, res) => {
        const { email, password } = req.body;
        console.log('[BACKEND][LOGIN] Attempt for email:', email);
        if (!email || !password) return res.status(400).json({ error: 'Email and password missing' });

        try {
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            console.log('[BACKEND][LOGIN] User found in DB:', rows.length > 0);
            if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

            const user = rows[0];
            if (user.status === 'INACTIVE') return res.status(403).json({ error: 'Account inactive' });

            const validPassword = await bcrypt.compare(password, user.password_hash);
            console.log('[BACKEND][LOGIN] Password valid:', validPassword);
            if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, requested_role: user.requested_role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '8h' }
            );

            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, requested_role: user.requested_role } });
        } catch (error) {
            console.error('Login error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    const setupAdmin = async (req, res) => {
        // Warning: This endpoint is strictly for initial setup purposes. 
        // In a production system, this would be removed or heavily guarded.
        try {
            const { rows: adminRows } = await pool.query("SELECT * FROM users WHERE role = 'ADMIN'");
            if (adminRows.length > 0) {
                return res.status(400).json({ error: 'Admin already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            
            const insertQuery = `
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ('Super Admin', 'admin@dashboard.local', $1, 'ADMIN')
                RETURNING id, name, email, role
            `;
            const { rows: newAdmin } = await pool.query(insertQuery, [hash]);

            res.status(201).json({ message: 'Default Admin created. Email: admin@dashboard.local, Password: admin123', user: newAdmin[0] });
        } catch (error) {
            console.error('Setup admin error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    const register = async (req, res) => {
        const { name, email, password } = req.body;
        console.log('[BACKEND][REGISTER] Attempt:', { name, email });
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        try {
            const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            console.log('[BACKEND][REGISTER] Existing user check:', existing.length);
            if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            console.log('[BACKEND][REGISTER] Password hashed, inserting user...');

            const { rows } = await pool.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, hash, 'VIEWER']
            );
            console.log('[BACKEND][REGISTER] User created:', rows[0]);

            const user = rows[0];
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, requested_role: null },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '8h' }
            );

            res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, requested_role: null } });
        } catch (error) {
            console.error('[BACKEND][REGISTER] Error:', error.message);
            console.error('[BACKEND][REGISTER] Full error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    return { login, register, setupAdmin };
};
