// src/models/giangvienModel.js
const db = require('../config/db');

exports.findAll = () =>
    // sắp xếp theo mgv thay vì id
    db.query('SELECT * FROM giangvien ORDER BY mgv DESC');

exports.findById = mgv =>
    // tìm theo mgv (khóa chính)
    db.query('SELECT * FROM giangvien WHERE mgv = ?', [mgv]);

exports.create = ({ mgv, ten, khoa, email, sdt, gioitinh }) =>
    db.query(
        'INSERT INTO giangvien (mgv, ten, khoa, email, sdt, gioitinh) VALUES (?,?,?,?,?,?)',
        [mgv, ten, khoa, email, sdt, gioitinh]
    );

exports.update = (mgv, { ten, khoa, email, sdt, gioitinh }) =>
    db.query(
        // cập nhật theo mgv
        'UPDATE giangvien SET ten = ?, khoa = ?, email = ?, sdt = ?, gioitinh = ? WHERE mgv = ?',
        [ten, khoa, email, sdt, gioitinh, mgv]
    );

exports.remove = mgv =>
    // xóa theo mgv
    db.query('DELETE FROM giangvien WHERE mgv = ?', [mgv]);
