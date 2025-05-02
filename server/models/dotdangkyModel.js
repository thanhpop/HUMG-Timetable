const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM dotdangky ORDER BY id DESC');

exports.findById = id =>
    db.query('SELECT * FROM dotdangky WHERE id = ?', [id]);

exports.create = ({ mahk, ngaybd_dk, ngaykt_dk }) =>
    db.query(
        'INSERT INTO dotdangky (mahk, ngaybd_dk, ngaykt_dk) VALUES (?,?,?)',
        [mahk, ngaybd_dk, ngaykt_dk]
    );

exports.update = (id, { mahk, ngaybd_dk, ngaykt_dk }) =>
    db.query(
        'UPDATE dotdangky SET mahk=?, ngaybd_dk=?, ngaykt_dk=? WHERE id=?',
        [mahk, ngaybd_dk, ngaykt_dk, id]
    );

exports.remove = id =>
    db.query('DELETE FROM dotdangky WHERE id = ?', [id]);
