// models/studentModel.js
const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM students ORDER BY id DESC');

exports.findById = id =>
    db.query('SELECT * FROM students WHERE id = ?', [id]);

exports.create = ({ msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi }) =>
    db.query(
        'INSERT INTO students (msv,ten,khoa,lop,gioitinh,ngaysinh,sdt,email,cccd,diachi) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi]
    );

exports.update = (id, { msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi }) =>
    db.query(
        'UPDATE students SET msv=?,ten=?,khoa=?,lop=?,gioitinh=?,ngaysinh=?,sdt=?,email=?,cccd=?,diachi=? WHERE id=?',
        [msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi, id]
    );

exports.remove = id =>
    db.query('DELETE FROM students WHERE id = ?', [id]);
