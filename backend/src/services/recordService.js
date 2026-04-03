class RecordService {
    constructor(pool) {
        this.pool = pool;
    }

    async getRecords(role, id, queryOptions) {
        let { page = 1, limit = 20, type, category, startDate, endDate, search } = queryOptions;
        page = parseInt(page); limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let conditions = ['r.deleted_at IS NULL'];
        let params = [];
        let idx = 1;

        // RBAC: Viewers only see their own records
        if (role === 'VIEWER') {
            conditions.push(`r.user_id = $${idx++}`);
            params.push(id);
        }

        if (type) { conditions.push(`r.type = $${idx++}`); params.push(type); }
        if (category) { conditions.push(`r.category ILIKE $${idx++}`); params.push(`%${category}%`); }
        if (startDate) { conditions.push(`r.date >= $${idx++}`); params.push(startDate); }
        if (endDate) { conditions.push(`r.date <= $${idx++}`); params.push(endDate); }
        if (search) {
            conditions.push(`(r.category ILIKE $${idx} OR r.notes ILIKE $${idx})`);
            params.push(`%${search}%`); idx++;
        }

        const where = conditions.join(' AND ');

        const countRes = await this.pool.query(`SELECT COUNT(*) FROM records r WHERE ${where}`, params);
        const total = parseInt(countRes.rows[0].count);

        const query = `SELECT r.*, u.name as user_name FROM records r LEFT JOIN users u ON r.user_id = u.id WHERE ${where} ORDER BY r.date DESC, r.id DESC LIMIT $${idx++} OFFSET $${idx++}`;
        params.push(limit, offset);

        const { rows } = await this.pool.query(query, params);
        
        return {
            data: rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }

    async createRecord(user_id, data) {
        const { amount, type, category, date, notes } = data;
        const { rows } = await this.pool.query(
            `INSERT INTO records (user_id, amount, type, category, date, notes)
             VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6) RETURNING *`,
            [user_id, amount, type, category, date || null, notes || null]
        );
        return rows[0];
    }

    async updateRecord(role, id, recordId, updates) {
        const { rows } = await this.pool.query(
            'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL', [recordId]
        );
        if (rows.length === 0) throw new Error('Record not found');

        const record = rows[0];
        if (role === 'VIEWER' && record.user_id !== id) {
            throw new Error('Forbidden');
        }

        const { amount, type, category, date, notes } = updates;
        const updateClauses = [];
        const params = [];
        let idx = 1;

        if (amount !== undefined)   { updateClauses.push(`amount = $${idx++}`);   params.push(amount); }
        if (type !== undefined)     { updateClauses.push(`type = $${idx++}`);     params.push(type); }
        if (category !== undefined) { updateClauses.push(`category = $${idx++}`); params.push(category); }
        if (date !== undefined)     { updateClauses.push(`date = $${idx++}`);     params.push(date); }
        if (notes !== undefined)    { updateClauses.push(`notes = $${idx++}`);    params.push(notes); }

        params.push(recordId);
        const { rows: updatedRows } = await this.pool.query(
            `UPDATE records SET ${updateClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
            params
        );
        return updatedRows[0];
    }

    async deleteRecord(role, id, recordId) {
        const { rows } = await this.pool.query(
            'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL', [recordId]
        );
        if (rows.length === 0) throw new Error('Record not found');

        if (role === 'VIEWER' && rows[0].user_id !== id) {
            throw new Error('Forbidden');
        }

        await this.pool.query('UPDATE records SET deleted_at = NOW() WHERE id = $1', [recordId]);
    }
}

module.exports = RecordService;
