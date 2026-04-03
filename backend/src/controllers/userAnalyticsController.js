const UserAnalyticsService = require('../services/userAnalyticsService');

module.exports = (pool) => {
    const analyticsService = new UserAnalyticsService(pool);

    const listUsers = async (req, res, next) => {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const result = await analyticsService.listUsers(page, 10);
            res.json(result);
        } catch (err) { next(err); }
    };

    const analyzeUser = async (req, res, next) => {
        try {
            const { role, id: requesterId } = req.user;
            let targetUserId = parseInt(req.params.userId);

            const result = await analyticsService.executeAnalyticsQuery(
                role, requesterId, targetUserId, req.query, false
            );
            res.json(result);
        } catch (err) { 
            if (err.message === 'Forbidden') return res.status(403).json({ error: 'Access denied' });
            next(err); 
        }
    };

    const analyzeAllUsers = async (req, res, next) => {
        try {
            const { role, id: requesterId } = req.user;

            const result = await analyticsService.executeAnalyticsQuery(
                role, requesterId, null, req.query, true
            );
            res.json(result);
        } catch (err) { 
            if (err.message === 'Forbidden') return res.status(403).json({ error: 'Access denied' });
            next(err); 
        }
    };

    return { listUsers, analyzeUser, analyzeAllUsers };
};
