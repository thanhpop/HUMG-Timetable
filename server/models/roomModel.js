const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM phonghoc ORDER BY maphong');

exports.findById = maphong =>
    db.query('SELECT * FROM phonghoc WHERE maphong = ?', [maphong]);

exports.create = ({ tenphong, khu, soluong }) =>
    db.query(
        'INSERT INTO phonghoc (tenphong,khu,soluong) VALUES (?,?,?)',
        [tenphong, khu, soluong]
    );

exports.update = (maphong, { tenphong, khu, soluong }) =>
    db.query(
        'UPDATE phonghoc SET tenphong = ?, khu = ?, soluong = ? WHERE maphong = ?',
        [tenphong, khu, soluong, maphong]
    );

exports.remove = maphong =>
    db.query('DELETE FROM phonghoc WHERE maphong = ?', [maphong]);
