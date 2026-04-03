const express = require('express');
const { authenticateToken } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/analyticsController')(pool);

    router.get('/summary',    authenticateToken, ctrl.getSummary);
    router.get('/categories', authenticateToken, ctrl.getCategories);
    router.get('/trends',     authenticateToken, ctrl.getTrends);
    router.get('/recent',     authenticateToken, ctrl.getRecent);

    return router;
};
