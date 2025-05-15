// File: models/dotdangkyModel.js
const db = require('../config/db');

exports.findAll = () =>
    // Only active records
    db.query('SELECT * FROM dotdangky WHERE is_active = 1 ORDER BY id DESC');

exports.findCurrent = () =>
    // Chỉ đợt active mà NOW() nằm giữa start/end
    db.query(
        `SELECT dk.*, hk.tenhk, hk.namhoc
     FROM dotdangky dk
     JOIN hocky hk   ON dk.mahk = hk.mahk
     WHERE dk.is_active = 1
       AND dk.ngaybd_dk <= NOW()
       AND dk.ngaykt_dk >= NOW()
     LIMIT 1`
    );

exports.findById = id =>
    db.query('SELECT * FROM dotdangky WHERE id = ?', [id]);

exports.create = ({ mahk, ngaybd_dk, ngaykt_dk, is_active = 1 }) =>
    db.query(
        'INSERT INTO dotdangky (mahk, ngaybd_dk, ngaykt_dk, is_active) VALUES (?,?,?,?)',
        [mahk, ngaybd_dk, ngaykt_dk, is_active]
    );

exports.update = (id, { mahk, ngaybd_dk, ngaykt_dk, is_active }) =>
    db.query(
        'UPDATE dotdangky SET mahk = ?, ngaybd_dk = ?, ngaykt_dk = ?, is_active = ? WHERE id = ?',
        [mahk, ngaybd_dk, ngaykt_dk, is_active, id]
    );
exports.remove = id =>
    db.query('DELETE FROM dotdangky WHERE id = ?', [id]);
