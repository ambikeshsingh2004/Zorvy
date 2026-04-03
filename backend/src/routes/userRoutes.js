const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

module.exports = (pool) => {
    const router = express.Router();
    const ctrl = require('../controllers/userController')(pool);

    router.get('/',        authenticateToken, requireRole(['ADMIN']), ctrl.getUsers);
    router.patch('/:id/role',
        authenticateToken,
        requireRole(['ADMIN']),
        validate(schemas.updateRole),
        ctrl.updateRole
    );
    router.post('/request-role',
        authenticateToken,
        validate(schemas.requestRole),
        ctrl.requestRole
    );

    return router;
};
