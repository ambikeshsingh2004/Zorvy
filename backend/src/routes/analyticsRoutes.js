const express = require('express');
const { authenticateToken } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/analyticsController')(pool);

    // Dashboard analytics summary
    router.get('/summary', authenticateToken, ctrl.getSummary);

    return router;
};
