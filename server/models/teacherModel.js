const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM teachers ORDER BY id DESC');

exports.findById = id =>
    db.query('SELECT * FROM teachers WHERE id = ?', [id]);

exports.create = ({ mgv, ten, khoa, email, sdt, gioitinh }) =>
    db.query(
        'INSERT INTO teachers (mgv, ten, khoa, email, sdt, gioitinh) VALUES (?,?,?,?,?,?)',
        [mgv, ten, khoa, email, sdt, gioitinh]
    );

exports.update = (id, { mgv, ten, khoa, email, sdt, gioitinh }) =>
    db.query(
        'UPDATE teachers SET mgv=?, ten=?, khoa=?, email=?, sdt=?, gioitinh=? WHERE id=?',
        [mgv, ten, khoa, email, sdt, gioitinh, id]
    );

exports.remove = id =>
    db.query('DELETE FROM teachers WHERE id = ?', [id]);
