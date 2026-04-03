const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/recordController')(pool);

    // All roles can read records (Viewers are filtered in controller)
    router.get('/', authenticateToken, ctrl.getRecords);

    // Admins and Viewers can create records. Analysts are Read-Only.
    router.post('/',
        authenticateToken,
        requireRole(['VIEWER', 'ADMIN']),
        validate(schemas.createRecord),
        ctrl.createRecord
    );

    // Update record
    router.put('/:id',
        authenticateToken,
        requireRole(['VIEWER', 'ADMIN']),
        validate(schemas.updateRecord),
        ctrl.updateRecord
    );

    // Soft delete
    router.delete('/:id',
        authenticateToken,
        requireRole(['VIEWER', 'ADMIN']),
        ctrl.deleteRecord
    );

    return router;
};
