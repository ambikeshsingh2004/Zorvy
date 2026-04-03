const express = require('express');
const { validate, schemas } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();
    const authController = require('../controllers/authController')(pool);

    router.post('/login', validate(schemas.login), authController.login);
    router.post('/register', validate(schemas.register), authController.register);
    router.post('/setup-admin', authController.setupAdmin);
    router.get('/me', authenticateToken, authController.getMe);

    return router;
};
