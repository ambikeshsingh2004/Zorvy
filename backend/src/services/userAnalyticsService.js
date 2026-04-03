class UserAnalyticsService {
    constructor(pool) {
        this.pool = pool;
    }

    async listUsers(page, limit) {
        const offset = (page - 1) * limit;

        const countResult = await this.pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        const { rows } = await this.pool.query(
            `SELECT id, name, email, role, status, created_at
             FROM users
             ORDER BY LOWER(name) ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            users: rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }

    async executeAnalyticsQuery(role, requesterId, targetUserId, filters, isGlobal = false) {
        // Enforce RBAC
        if (role === 'VIEWER') {
            if (isGlobal || targetUserId !== requesterId) {
                throw new Error('Forbidden');
            }
            targetUserId = requesterId;
        }

        const { startDate, endDate, type = 'all', includeDeleted = 'false', page = 1 } = filters;
        const limit = 20;
        const currentPage = Math.max(1, parseInt(page));
        const offset = (currentPage - 1) * limit;
        
        const conditions = [];
        const params = [];
        let paramIdx = 1;

        if (!isGlobal) {
            conditions.push(`r.user_id = $${paramIdx++}`);
            params.push(targetUserId);
        }

        if (includeDeleted !== 'true') {
            conditions.push('r.deleted_at IS NULL');
        }

        if (startDate) {
            conditions.push(`r.date >= $${paramIdx++}`);
            params.push(startDate);
        }
        if (endDate) {
            conditions.push(`r.date <= $${paramIdx++}`);
            params.push(endDate);
        }

        if (type && type !== 'all') {
            conditions.push(`r.type = $${paramIdx++}`);
            params.push(type);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // 1. Summary
        let summaryQuery = `
            SELECT
                COALESCE(SUM(CASE WHEN r.type='income'  THEN r.amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN r.type='expense' THEN r.amount ELSE 0 END), 0) AS total_expense,
                COUNT(*) AS total_records
            FROM records r
            ${whereClause}
        `;
        const summaryResult = await this.pool.query(summaryQuery, params);
        const s = summaryResult.rows[0];

        // 2. Records
        let selectStatement = 'SELECT r.id, r.amount, r.type, r.category, r.date, r.notes, r.deleted_at, r.created_at';
        let fromStatement = 'FROM records r';
        if (isGlobal) {
            selectStatement += ', u.email as user_email';
            fromStatement += ' LEFT JOIN users u ON r.user_id = u.id';
        }
        
        const recordsQuery = `
            ${selectStatement}
            ${fromStatement}
            ${whereClause}
            ORDER BY r.date DESC
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}
        `;
        params.push(limit, offset);
        const recordsResult = await this.pool.query(recordsQuery, params);

        // 3. Trends
        let trendBucket = 'day';
        let trendFormat = 'YYYY-MM-DD';
        if (startDate && endDate) {
            const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            if (daysDiff > 60) {
                trendBucket = 'month';
                trendFormat = 'YYYY-MM';
            }
        } else if (!startDate && !endDate) {
            trendBucket = 'month';
            trendFormat = 'YYYY-MM';
        }

        const trendsQuery = `
            SELECT
                TO_CHAR(DATE_TRUNC('${trendBucket}', r.date), '${trendFormat}') AS period,
                COALESCE(SUM(CASE WHEN r.type='income'  THEN r.amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN r.type='expense' THEN r.amount ELSE 0 END), 0) AS expense
            FROM records r
            ${whereClause}
            GROUP BY DATE_TRUNC('${trendBucket}', r.date)
            ORDER BY period ASC
        `;
        const trendsResult = await this.pool.query(trendsQuery, params);

        // 4. Categories
        const categoryQuery = `
            SELECT
                r.category,
                r.type,
                COALESCE(SUM(r.amount), 0) AS total,
                COUNT(*) AS count
            FROM records r
            ${whereClause}
            GROUP BY r.category, r.type
            ORDER BY total DESC
        `;
        const categoryResult = await this.pool.query(categoryQuery, params);

        // Result payload construction
        const payload = {
            filters,
            summary: {
                total_income: parseFloat(s.total_income),
                total_expense: parseFloat(s.total_expense),
                net_balance: parseFloat(s.total_income) - parseFloat(s.total_expense),
                total_records: parseInt(s.total_records)
            },
            trends: trendsResult.rows.map(r => ({
                period: r.period,
                income: parseFloat(r.income),
                expense: parseFloat(r.expense)
            })),
            categories: categoryResult.rows.map(r => ({
                category: r.category,
                type: r.type,
                total: parseFloat(r.total),
                count: parseInt(r.count)
            })),
            records: recordsResult.rows,
            pagination: {
                page: currentPage,
                limit: limit,
                total: parseInt(s.total_records),
                totalPages: Math.max(1, Math.ceil(parseInt(s.total_records) / limit))
            }
        };

        if (!isGlobal) {
            const userResult = await this.pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetUserId]);
            payload.user = userResult.rows[0] || null;
        }

        return payload;
    }
}

module.exports = UserAnalyticsService;
