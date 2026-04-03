const express = require('express');

module.exports = (pool) => {
    const router = express.Router();
    const authController = require('../controllers/authController')(pool);

    router.post('/login', authController.login);
    router.post('/register', authController.register);
    router.post('/setup-admin', authController.setupAdmin); // Seed admin endpoint

    return router;
};
