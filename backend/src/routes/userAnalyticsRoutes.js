const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/userAnalyticsController')(pool);

    // List all users (paginated, sorted by name) — ADMIN & ANALYST only
    router.get('/users',
        authenticateToken,
        requireRole(['ADMIN', 'ANALYST']),
        ctrl.listUsers
    );

    // Analyze a specific user — ADMIN & ANALYST can query any user, VIEWER forced to own data
    router.get('/analyze/:userId',
        authenticateToken,
        ctrl.analyzeUser
    );

    // Analyze all users — ADMIN & ANALYST only
    router.get('/analyze-all',
        authenticateToken,
        requireRole(['ADMIN', 'ANALYST']),
        ctrl.analyzeAllUsers
    );

    return router;
};
