const RecordService = require('../services/recordService');

module.exports = (pool) => {
    const recordService = new RecordService(pool);

    const getRecords = async (req, res, next) => {
        try {
            const { role, id } = req.user;
            const result = await recordService.getRecords(role, id, req.query);
            res.json(result);
        } catch (err) { next(err); }
    };

    const createRecord = async (req, res, next) => {
        try {
            const record = await recordService.createRecord(req.user.id, req.body);
            res.status(201).json(record);
        } catch (err) { next(err); }
    };

    const updateRecord = async (req, res, next) => {
        try {
            const recordId = req.params.id;
            const { role, id } = req.user;
            const updated = await recordService.updateRecord(role, id, recordId, req.body);
            res.json(updated);
        } catch (err) { 
            if (err.message === 'Record not found') return res.status(404).json({ error: err.message });
            if (err.message === 'Forbidden') return res.status(403).json({ error: 'You can only update your own records' });
            next(err); 
        }
    };

    const deleteRecord = async (req, res, next) => {
        try {
            const recordId = req.params.id;
            const { role, id } = req.user;
            await recordService.deleteRecord(role, id, recordId);
            res.json({ message: 'Record deleted successfully' });
        } catch (err) { 
            if (err.message === 'Record not found') return res.status(404).json({ error: err.message });
            if (err.message === 'Forbidden') return res.status(403).json({ error: 'You can only delete your own records' });
            next(err); 
        }
    };

    return { getRecords, createRecord, updateRecord, deleteRecord };
};
