module.exports = (pool) => {
    // Scope helper: Viewers see only their own data
    const scopeCondition = (role, id, startIdx = 1) => {
        if (role === 'VIEWER') return { clause: `AND user_id = $${startIdx}`, params: [id] };
        return { clause: '', params: [] };
    };

    // GET /dashboard/analytics/summary
    const getSummary = async (req, res, next) => {
        try {
            const { role, id } = req.user;
            const { clause, params } = scopeCondition(role, id);

            const { rows } = await pool.query(`
                SELECT
                    COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0)  AS total_income,
                    COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0)  AS total_expense,
                    COUNT(*) AS total_records
                FROM records
                WHERE deleted_at IS NULL ${clause}
            `, params);

            const d = rows[0];
            res.json({
                total_income:   parseFloat(d.total_income),
                total_expense:  parseFloat(d.total_expense),
                net_balance:    parseFloat(d.total_income) - parseFloat(d.total_expense),
                total_records:  parseInt(d.total_records)
            });
        } catch (err) { next(err); }
    };

    // GET /dashboard/analytics/categories
    const getCategories = async (req, res, next) => {
        try {
            const { role, id } = req.user;
            const { clause, params } = scopeCondition(role, id);

            const { rows } = await pool.query(`
                SELECT
                    category,
                    type,
                    COALESCE(SUM(amount), 0) AS total,
                    COUNT(*) AS count
                FROM records
                WHERE deleted_at IS NULL ${clause}
                GROUP BY category, type
                ORDER BY total DESC
            `, params);

            res.json(rows.map(r => ({
                category: r.category,
                type:     r.type,
                total:    parseFloat(r.total),
                count:    parseInt(r.count)
            })));
        } catch (err) { next(err); }
    };

    // GET /dashboard/analytics/trends  (last 6 months)
    const getTrends = async (req, res, next) => {
        try {
            const { role, id } = req.user;
            const { clause, params } = scopeCondition(role, id);

            const { rows } = await pool.query(`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
                    COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS income,
                    COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense
                FROM records
                WHERE deleted_at IS NULL
                  AND date >= NOW() - INTERVAL '6 months'
                  ${clause}
                GROUP BY DATE_TRUNC('month', date)
                ORDER BY month ASC
            `, params);

            res.json(rows.map(r => ({
                month:   r.month,
                income:  parseFloat(r.income),
                expense: parseFloat(r.expense),
                net:     parseFloat(r.income) - parseFloat(r.expense)
            })));
        } catch (err) { next(err); }
    };

    // GET /dashboard/analytics/recent
    const getRecent = async (req, res, next) => {
        try {
            const { role, id } = req.user;
            const { clause, params } = scopeCondition(role, id);

            const { rows } = await pool.query(`
                SELECT r.*, u.name AS user_name
                FROM records r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.deleted_at IS NULL ${clause}
                ORDER BY r.created_at DESC
                LIMIT 5
            `, params);

            res.json(rows);
        } catch (err) { next(err); }
    };

    return { getSummary, getCategories, getTrends, getRecent };
};
