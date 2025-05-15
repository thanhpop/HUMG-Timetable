// server/controllers/dangkyController.js
const Registration = require('../models/dangkyModel');
const LichHoc = require('../models/lichhocModel');
const db = require('../config/db');
exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Registration.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getByStudent = async (req, res, next) => {
    try {
        const msv = req.params.msv;
        const [rows] = await Registration.findByStudent(msv);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    const { msv, lichhoc_id } = req.body;
    if (!msv || !lichhoc_id) return res.status(400).json({ error: 'Thiếu msv hoặc lichhoc_id' });

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // A. SELECT … FOR UPDATE
        const [rows] = await conn.query(
            `SELECT
         ph.succhua AS capacity,
         (SELECT COUNT(*) FROM dangky d WHERE d.lichhoc_id = ?) AS current_count
       FROM lichhoc l
       JOIN nhommh nh   ON l.manhom  = nh.manhom
       JOIN phonghoc ph ON l.maphong = ph.maphong
       WHERE l.id = ?
       FOR UPDATE`,
            [lichhoc_id, lichhoc_id]
        );
        if (!rows.length) {
            await conn.rollback();
            return res.status(404).json({ error: 'Buổi học không tồn tại' });
        }
        const { capacity, current_count } = rows[0];
        if (current_count >= capacity) {
            await conn.rollback();
            return res.status(400).json({ error: 'Buổi học đã hết chỗ.' });
        }

        const [[session]] = await conn.query(
            `SELECT l.thu, l.tietbd, l.tietkt, l.ngaybd, l.ngaykt, nh.mamh
   FROM lichhoc l
   JOIN nhommh nh ON l.manhom = nh.manhom
   WHERE l.id = ?`,
            [lichhoc_id]
        );

        // 2) Lấy tất cả buổi của các môn KHÁC mà sinh viên đã đăng ký (trong dangky)
        const [existing] = await conn.query(
            `SELECT lh.thu, lh.tietbd, lh.tietkt, lh.ngaybd, lh.ngaykt
   FROM dangky d
   JOIN lichhoc lh  ON d.lichhoc_id = lh.id
   JOIN nhommh   nh  ON lh.manhom = nh.manhom
   WHERE d.msv = ? 
     AND nh.mamh <> ?`,    /* loại trừ cùng môn */
            [msv, session.mamh]
        );

        // 3) Kiểm tra xung đột: cùng thứ, ngày overlap và tiết overlap
        const conflict = existing.some(s => {
            // cùng thứ
            if (s.thu !== session.thu) return false;

            // ngày overlap?
            const a1 = new Date(s.ngaybd), b1 = new Date(s.ngaykt);
            const a2 = new Date(session.ngaybd), b2 = new Date(session.ngaykt);
            const dateOverlap = !(b1 < a2 || b2 < a1);
            if (!dateOverlap) return false;

            // tiết overlap?
            return !(s.tietkt < session.tietbd || s.tietbd > session.tietkt);
        });

        if (conflict) {
            await conn.rollback();
            return res.status(400).json({ error: 'Xung đột lịch với buổi đã đăng ký.' });
        }
        // C. INSERT
        const [result] = await conn.query(
            `INSERT INTO dangky (msv, lichhoc_id) VALUES (?, ?)`,
            [msv, lichhoc_id]
        );

        // D. COMMIT
        await conn.commit();

        // E. Trả về record mới
        const [[newRow]] = await conn.query(
            `SELECT * FROM dangky WHERE id = ?`,
            [result.insertId]
        );
        return res.status(201).json(newRow);

    } catch (err) {
        if (conn) await conn.rollback();
        return next(err);
    } finally {
        if (conn) conn.release();
    }
};


exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { msv, lichhoc_id } = req.body;
        const [result] = await Registration.update(id, { msv, lichhoc_id });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Registration.findById(id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id;
        const [result] = await Registration.remove(id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};

exports.countByLichHoc = async (req, res, next) => {
    try {
        const [rows] = await Registration.countByLichHoc();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};


