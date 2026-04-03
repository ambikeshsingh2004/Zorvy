const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/recordController')(pool);

    // All roles can read records (Viewer filters implicitly handled in controller)
    router.get('/', authenticateToken, ctrl.getRecords);
    
    // Admins and Viewers can create/delete. Analysts are Read-Only globally.
    router.post('/', authenticateToken, requireRole(['VIEWER', 'ADMIN']), ctrl.createRecord);
    router.delete('/:id', authenticateToken, requireRole(['VIEWER', 'ADMIN']), ctrl.deleteRecord);

    return router;
};
