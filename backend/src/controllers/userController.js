module.exports = (pool) => {
    // Admin only
    const getUsers = async (req, res) => {
        try {
            const { rows } = await pool.query('SELECT id, name, email, role, status, requested_role FROM users ORDER BY created_at DESC');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    };

    // Admin only
    const updateRole = async (req, res) => {
        try {
            const userId = req.params.id;
            const { role } = req.body; // e.g. 'ANALYST', 'VIEWER'
            
            await pool.query(
                'UPDATE users SET role = $1, requested_role = NULL WHERE id = $2',
                [role, userId]
            );
            res.json({ message: 'User role updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update role' });
        }
    };

    // Authenticated users
    const requestRole = async (req, res) => {
        try {
            const { id } = req.user;
            const { requestedRole } = req.body; // e.g. 'ANALYST'

            if (!['ANALYST', 'ADMIN'].includes(requestedRole)) {
                return res.status(400).json({ error: 'Invalid role request' });
            }

            await pool.query(
                'UPDATE users SET requested_role = $1 WHERE id = $2',
                [requestedRole, id]
            );
            res.json({ message: 'Request submitted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to request role' });
        }
    };

    return { getUsers, updateRole, requestRole };
};
