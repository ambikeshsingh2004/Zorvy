// Global error handler — must be registered LAST in Express
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

    // Joi validation errors
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details.map(d => d.message)
        });
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Duplicate entry — record already exists' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referenced record does not exist' });
    }
    if (err.code === '23514') {
        return res.status(400).json({ error: 'Value violates a database constraint' });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired — please login again' });
    }

    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;
