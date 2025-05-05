const db = require('../config/db');

// Lấy tất cả nhóm
exports.findAll = () =>
    db.query(`
        SELECT 
            nhommh.*, 
            phonghoc.tenphong, 
            phonghoc.khu
        FROM nhommh
        LEFT JOIN phonghoc ON nhommh.maphong = phonghoc.maphong
        ORDER BY nhommh.manhom
    `);

// Tìm theo mã nhóm
exports.findById = manhom =>
    db.query(`
        SELECT 
            nhommh.*, 
            phonghoc.tenphong, 
            phonghoc.khu
        FROM nhommh
        LEFT JOIN phonghoc ON nhommh.maphong = phonghoc.maphong
        WHERE nhommh.manhom = ?
    `, [manhom]);

// Thêm nhóm mới
exports.create = ({ manhom, tennhom, mamh, mgv, maphong, mahk }) =>
    db.query(
        'INSERT INTO nhommh (manhom, tennhom, mamh, mgv, maphong, mahk) VALUES (?, ?, ?, ?, ?, ?)',
        [manhom, tennhom, mamh, mgv, maphong, mahk]
    );

// Cập nhật nhóm
exports.update = (manhom, { tennhom, mamh, mgv, maphong, mahk }) =>
    db.query(
        'UPDATE nhommh SET tennhom = ?, mamh = ?, mgv = ?, maphong = ?, mahk = ? WHERE manhom = ?',
        [tennhom, mamh, mgv, maphong, mahk, manhom]
    );

// Xóa nhóm
exports.remove = manhom =>
    db.query('DELETE FROM nhommh WHERE manhom = ?', [manhom]);
