const EnhancedTKB = require('../models/EnhancedTKBAlgorithm');
const db = require('../config/db');


exports.createTimetable = async (req, res, next) => {
    try {
        const { mahk } = req.body;
        if (!mahk) {
            return res.status(400).json({ error: 'Thiếu mã học kỳ (mahk)' });
        }

        const { tkb, conflicts } = await EnhancedTKB.generateTKBForSemester(mahk);
        return res.json({
            success: true,
            scheduled: tkb.length,
            conflicts,
            tkb
        });
    } catch (err) {
        next(err);
    }
};