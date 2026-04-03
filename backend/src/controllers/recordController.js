module.exports = (pool) => {
    const getRecords = async (req, res) => {
        try {
            const { role, id } = req.user;
            let { page = 1, limit = 20, type, category } = req.query;
            const offset = (page - 1) * limit;

            let query = 'SELECT * FROM records WHERE deleted_at IS NULL';
            let params = [];
            let paramIdx = 1;

            // RBAC Filtering - Viewers only see their own
            if (role === 'VIEWER') {
                query += ` AND user_id = $${paramIdx++}`;
                params.push(id);
            }

            // Filtering
            if (type) {
                query += ` AND type = $${paramIdx++}`;
                params.push(type);
            }
            if (category) {
                query += ` AND category = $${paramIdx++}`;
                params.push(category);
            }

            // Pagination
            query += ` ORDER BY date DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
            params.push(limit, offset);

            const { rows } = await pool.query(query, params);
            res.json({ data: rows, page: parseInt(page), limit: parseInt(limit) });
        } catch (error) {
            console.error('getRecords error', error);
            res.status(500).json({ error: 'Failed to fetch records' });
        }
    };

    const createRecord = async (req, res) => {
        try {
            const { amount, type, category, date, notes } = req.body;
            const user_id = req.user.id;

            const q = `INSERT INTO records (user_id, amount, type, category, date, notes) 
                       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const { rows } = await pool.query(q, [user_id, amount, type, category, date, notes]);
            res.status(201).json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create record' });
        }
    };

    const deleteRecord = async (req, res) => {
        try {
            const recordId = req.params.id;
            const { role, id } = req.user;

            let authCheck = 'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL';
            const { rows } = await pool.query(authCheck, [recordId]);
            if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

            if (role === 'VIEWER' && rows[0].user_id !== id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Soft delete
            await pool.query('UPDATE records SET deleted_at = NOW() WHERE id = $1', [recordId]);
            res.json({ message: 'Record deleted' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete record' });
        }
    };

    return { getRecords, createRecord, deleteRecord };
};
