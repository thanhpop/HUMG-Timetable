const db = require('../config/db');

// lấy tất cả
exports.findAll = () =>
    db.query('SELECT * FROM phonghoc ORDER BY maphong');

// lấy 1 theo maphong (varchar)
exports.findById = maphong =>
    db.query('SELECT * FROM phonghoc WHERE maphong = ?', [maphong]);

// tạo mới phải truyền maphong
exports.create = ({ maphong, tenphong, khu, succhua }) =>
    db.query(
        'INSERT INTO phonghoc (maphong, tenphong, khu, succhua) VALUES (?,?,?,?)',
        [maphong, tenphong, khu, succhua]
    );

// cập nhật theo maphong
exports.update = (maphong, { tenphong, khu, succhua }) =>
    db.query(
        'UPDATE phonghoc SET tenphong=?, khu=?, succhua=? WHERE maphong=?',
        [tenphong, khu, succhua, maphong]
    );

// xóa theo maphong
exports.remove = maphong =>
    db.query('DELETE FROM phonghoc WHERE maphong = ?', [maphong]);
