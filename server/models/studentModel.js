// models/studentModel.js
const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM students ORDER BY id DESC');

exports.findById = id =>
    db.query('SELECT * FROM students WHERE id = ?', [id]);

exports.create = ({ msv, name, khoa, lop, gender, dob, sdt, email, cccd, diachi }) =>
    db.query(
        'INSERT INTO students (msv,name,khoa,lop,gender,dob,sdt,email,cccd,diachi) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [msv, name, khoa, lop, gender, dob, sdt, email, cccd, diachi]
    );

exports.update = (id, { msv, name, khoa, lop, gender, dob, sdt, email, cccd, diachi }) =>
    db.query(
        'UPDATE students SET msv=?,name=?,khoa=?,lop=?,gender=?,dob=?,sdt=?,email=?,cccd=?,diachi=? WHERE id=?',
        [msv, name, khoa, lop, gender, dob, sdt, email, cccd, diachi, id]
    );

exports.remove = id =>
    db.query('DELETE FROM students WHERE id = ?', [id]);
