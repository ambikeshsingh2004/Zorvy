const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/userController')(pool);

    // Only admins can see users and modify roles directly
    router.get('/', authenticateToken, requireRole(['ADMIN']), ctrl.getUsers);
    router.patch('/:id/role', authenticateToken, requireRole(['ADMIN']), ctrl.updateRole);

    // Any authenticated user can request a role upgrade
    router.post('/request-role', authenticateToken, ctrl.requestRole);

    return router;
};
