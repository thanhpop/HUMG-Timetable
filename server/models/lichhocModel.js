// server/models/lichhocModel.js
const db = require('../config/db');

exports.findAll = () => {
  const sql = `
    SELECT 
      lh.id,
      lh.manhom,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.khoa, 
      mh.sotinchi,
      nh.maphong,
      p.tenphong,
      p.succhua,
      p.khu,
      nh.mgv,
      gv.ten    AS tengv,
      lh.thu,
      lh.tietbd,
      lh.tietkt,
      lh.ngaybd,
      lh.ngaykt
    FROM lichhoc lh
    JOIN nhommh nh    ON lh.manhom   = nh.manhom
    JOIN monhoc mh    ON nh.mamh      = mh.mamh
    JOIN phonghoc p   ON nh.maphong   = p.maphong
    JOIN giangvien gv ON nh.mgv      = gv.mgv
    ORDER BY lh.id DESC
  `;
  return db.query(sql);
};

exports.findById = id => {
  const sql = `
      SELECT 
        lh.id,
        lh.manhom,
        nh.tennhom,
        nh.mamh,
        mh.tenmh,
        mh.khoa, 
        mh.sotinchi,
        nh.maphong,
        p.tenphong,
        p.succhua,
        p.khu,
        nh.mgv,
        gv.ten    AS tengv,
        lh.thu,
        lh.tietbd,
        lh.tietkt,
        lh.ngaybd,
        lh.ngaykt
      FROM lichhoc lh
      JOIN nhommh    nh ON lh.manhom  = nh.manhom
      JOIN monhoc    mh ON nh.mamh     = mh.mamh
      JOIN phonghoc  p  ON nh.maphong  = p.maphong
      JOIN giangvien gv ON nh.mgv      = gv.mgv
      WHERE lh.id = ?
    `;
  return db.query(sql, [id]);
};


exports.create = ({ manhom, thu, tietbd, tietkt, ngaybd, ngaykt }) =>
  db.query(
    'INSERT INTO lichhoc (manhom,thu,tietbd,tietkt,ngaybd,ngaykt) VALUES (?,?,?,?,?,?)',
    [manhom, thu, tietbd, tietkt, ngaybd, ngaykt]
  );

exports.update = (id, data) =>
  db.query(
    'UPDATE lichhoc SET manhom=?,thu=?,tietbd=?,tietkt=?,ngaybd=?,ngaykt=? WHERE id=?',
    [data.manhom, data.thu, data.tietbd, data.tietkt, data.ngaybd, data.ngaykt, id]
  );

exports.remove = id =>
  db.query('DELETE FROM lichhoc WHERE id = ?', [id]);
