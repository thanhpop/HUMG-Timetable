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
        nh.mahk,
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
      JOIN phonghoc p    ON lh.maphong      = p.maphong
      WHERE d.msv = ?
      ORDER BY d.ngaydk DESC
    `;
    return db.query(sql, [msv]);
};
exports.countByLichHoc = () =>
    db.query(
        `SELECT lichhoc_id, COUNT(*) AS count
     FROM dangky
     GROUP BY lichhoc_id`
    );
exports.countFor = async (lichhoc_id) => {
    const rows = await db.query(
        'SELECT COUNT(*) AS count FROM dangky WHERE lichhoc_id = ?',
        [lichhoc_id]
    );
    return rows[0].count;
};

exports.findById = id =>
    db.query('SELECT * FROM dangky WHERE id = ?', [id]);

exports.create = ({ msv, lichhoc_id, manhom }) =>
    db.query(
        'INSERT INTO dangky (msv, lichhoc_id, manhom) VALUES (?, ?, ?)',
        [msv, lichhoc_id, manhom]
    );

exports.update = (id, { msv, lichhoc_id, manhom, trangthai }) =>
    db.query(
        'UPDATE dangky SET msv = ?, lichhoc_id = ?, manhom = ?, trangthai = ? WHERE id = ?',
        [msv, lichhoc_id, id]
    );

exports.remove = id =>
    db.query('DELETE FROM dangky WHERE id = ?', [id]);


exports.removeByLichHoc = lichhoc_id =>
    db.query('DELETE FROM dangky WHERE lichhoc_id = ?', [lichhoc_id]);

exports.getCapacityAndCountForUpdate = lichhoc_id =>
    db.query(
        `SELECT 
       ph.succhua              AS capacity,
       (SELECT COUNT(*) FROM dangky d WHERE d.lichhoc_id = ?) AS current_count
     FROM lichhoc l
     JOIN nhommh nh   ON l.manhom  = nh.manhom
     JOIN phonghoc ph ON l.maphong = ph.maphong
     WHERE l.id = ?
     FOR UPDATE`,
        [lichhoc_id, lichhoc_id]
    );