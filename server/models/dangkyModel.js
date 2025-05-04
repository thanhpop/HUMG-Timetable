// server/models/dangkyModel.js
const db = require('../config/db');

exports.findAll = () =>
    db.query('SELECT * FROM dangky ORDER BY id DESC');

exports.findByStudent = msv => {
    const sql = `
      SELECT 
        d.id,
        d.msv,
        d.ngaydk,
        lh.id           AS lichhoc_id,
        lh.thu,
        lh.tietbd,
        lh.tietkt,
        lh.ngaybd,
        lh.ngaykt,
        nh.mamh,
        nh.tennhom,
        mh.tenmh,
        mh.sotinchi,
        gv.ten    AS tengv,
        p.tenphong,
        p.khu
      FROM dangky d
      JOIN lichhoc lh    ON d.lichhoc_id = lh.id
      JOIN nhommh nh     ON lh.manhom      = nh.manhom
      JOIN monhoc mh     ON nh.mamh         = mh.mamh
      JOIN giangvien gv  ON nh.mgv          = gv.mgv
      JOIN phonghoc p    ON nh.maphong      = p.maphong
      WHERE d.msv = ?
      ORDER BY d.ngaydk DESC
    `;
    return db.query(sql, [msv]);
};

exports.findById = id =>
    db.query('SELECT * FROM dangky WHERE id = ?', [id]);

exports.create = ({ msv, lichhoc_id }) =>
    db.query(
        'INSERT INTO dangky (msv, lichhoc_id) VALUES (?, ?)',
        [msv, lichhoc_id]
    );

exports.update = (id, { msv, lichhoc_id }) =>
    db.query(
        'UPDATE dangky SET msv = ?, lichhoc_id = ? WHERE id = ?',
        [msv, lichhoc_id, id]
    );

exports.remove = id =>
    db.query('DELETE FROM dangky WHERE id = ?', [id]);
