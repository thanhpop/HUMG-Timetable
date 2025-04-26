// models/studentModel.js
const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM sinhvien ORDER BY msv DESC');

exports.findById = msv =>
    db.query('SELECT * FROM sinhvien WHERE msv = ?', [msv]);

exports.create = ({ msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi }) =>
    db.query(
        'INSERT INTO sinhvien (msv,ten,khoa,lop,gioitinh,ngaysinh,sdt,email,cccd,diachi) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [msv, ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi]
    );

exports.update = (msv, { ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi }) =>
    db.query(
        'UPDATE sinhvien SET ten=?,khoa=?,lop=?,gioitinh=?,ngaysinh=?,sdt=?,email=?,cccd=?,diachi=? WHERE msv=?',
        [ten, khoa, lop, gioitinh, ngaysinh, sdt, email, cccd, diachi, msv]
    );

exports.remove = msv =>
    db.query('DELETE FROM sinhvien WHERE msv = ?', [msv]);
