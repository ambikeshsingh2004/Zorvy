module.exports = (pool) => {
    const getSummary = async (req, res) => {
        try {
            const { role, id } = req.user;
            let query = `
                SELECT 
                    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
                FROM records 
                WHERE deleted_at IS NULL
            `;
            let params = [];

            if (role === 'VIEWER') {
                query += ' AND user_id = $1';
                params.push(id);
            }

            const { rows } = await pool.query(query, params);
            const data = rows[0];
            
            res.json({
                total_income: parseFloat(data.total_income || 0),
                total_expense: parseFloat(data.total_expense || 0),
                net_balance: parseFloat(data.total_income || 0) - parseFloat(data.total_expense || 0)
            });
        } catch (error) {
            console.error('Analytics error', error);
            res.status(500).json({ error: 'Failed to calculate analytics' });
        }
    };

    return { getSummary };
};
