const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM nhommh ORDER BY manhom');

exports.findById = manhom =>
    db.query('SELECT * FROM nhommh WHERE manhom = ?', [manhom]);

exports.create = ({ manhom, tennhom, mamh, mgv, maphong, soluongsv }) =>
    db.query(
        'INSERT INTO nhommh (manhom,tennhom,mamh,mgv,maphong,soluongsv) VALUES (?,?,?,?,?,?)',
        [manhom, tennhom, mamh, mgv, maphong, soluongsv]
    );

exports.update = (manhom, { tennhom, mamh, mgv, maphong, soluongsv }) =>
    db.query(
        'UPDATE nhommh SET tennhom=?, mamh=?, mgv=?, maphong=?, soluongsv=? WHERE manhom=?',
        [tennhom, mamh, mgv, maphong, soluongsv, manhom]
    );

exports.remove = manhom =>
    db.query('DELETE FROM nhommh WHERE manhom = ?', [manhom]);
