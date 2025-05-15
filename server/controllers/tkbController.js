const EnhancedTKB = require('../models/EnhancedTKBAlgorithm');
const db = require('../config/db');

exports.createTimetable = async (req, res, next) => {
    try {
        const { mahk } = req.body;
        if (!mahk) return res.status(400).json({ error: 'Thiếu mã học kỳ (mahk)' });

        const { tkb, conflicts } = await EnhancedTKB.generateTKBForSemester(mahk);

        // Lưu vào lichhoc
        for (const e of tkb) {
            await db.query(
                `INSERT INTO lichhoc
           (manhom, maphong, thu, tietbd, tietkt, ngaybd, ngaykt)
         VALUES (?,?, ?, ?, ?, ?, ?)`,
                [e.manhom, e.maphong, e.thu, e.tietbd, e.tietkt, e.ngaybd, e.ngaykt]
            );
        }

        res.json({ success: true, scheduled: tkb.length, conflicts });
    } catch (err) {
        next(err);
    }
};
