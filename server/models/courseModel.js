// models/courseModel.js
const db = require('../config/db');

// Lấy tất cả môn học, sắp xếp theo mamh giảm dần
exports.findAll = () =>
    db.query('SELECT * FROM monhoc ORDER BY mamh DESC');

// Lấy môn học theo mã môn học (mamh)
exports.findById = mamh =>
    db.query('SELECT * FROM monhoc WHERE mamh = ?', [mamh]);

// Thêm môn học mới
exports.create = ({ mamh, tenmh, sotinchi, khoa }) =>
    db.query(
        'INSERT INTO monhoc (mamh, tenmh, sotinchi, khoa) VALUES (?, ?, ?, ?)',
        [mamh, tenmh, sotinchi, khoa]
    );

// Cập nhật môn học theo mã môn học
exports.update = (mamh, { tenmh, sotinchi, khoa }) =>
    db.query(
        'UPDATE monhoc SET tenmh = ?, sotinchi = ?, khoa = ? WHERE mamh = ?',
        [tenmh, sotinchi, khoa, mamh]
    );

// Xóa môn học theo mã môn học
exports.remove = mamh =>
    db.query('DELETE FROM monhoc WHERE mamh = ?', [mamh]);
