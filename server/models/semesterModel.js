const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM hocky ORDER BY mahk');

exports.findByKey = mahk =>
    db.query('SELECT * FROM hocky WHERE mahk = ?', [mahk]);

exports.create = ({ mahk, tenhk, namhoc, ngaybd, ngaykt }) =>
    db.query(
        'INSERT INTO hocky (mahk,tenhk,namhoc,ngaybd,ngaykt) VALUES (?,?,?,?,?)',
        [mahk, tenhk, namhoc, ngaybd, ngaykt]
    );

exports.update = (mahk, { tenhk, namhoc, ngaybd, ngaykt }) =>
    db.query(
        'UPDATE hocky SET tenhk=?, namhoc=?, ngaybd=?, ngaykt=? WHERE mahk=?',
        [tenhk, namhoc, ngaybd, ngaykt, mahk]
    );

exports.remove = mahk =>
    db.query('DELETE FROM hocky WHERE mahk = ?', [mahk]);
