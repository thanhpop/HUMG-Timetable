// models/studentModel.js
const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM students ORDER BY id DESC');

exports.findById = id =>
    db.query('SELECT * FROM students WHERE id = ?', [id]);

exports.create = ({ msv, name, khoa, lop, gender, dob, sdt, email, cccd }) =>
    db.query(
        'INSERT INTO students (msv,name,khoa,lop,gender,dob,sdt,email,cccd) VALUES (?,?,?,?,?,?,?,?,?)',
        [msv, name, khoa, lop, gender, dob, sdt, email, cccd]
    );

exports.update = (id, { msv, name, khoa, lop, gender, dob, sdt, email, cccd }) =>
    db.query(
        'UPDATE students SET msv=?,name=?,khoa=?,lop=?,gender=?,dob=?,sdt=?,email=?,cccd=? WHERE id=?',
        [msv, name, khoa, lop, gender, dob, sdt, email, cccd, id]
    );

exports.remove = id =>
    db.query('DELETE FROM students WHERE id = ?', [id]);
