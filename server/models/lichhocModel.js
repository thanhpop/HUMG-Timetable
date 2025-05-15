// server/models/lichhocModel.js
const db = require('../config/db');

exports.findAll = () => {
  const sql = `
    SELECT 
      lh.id,
      lh.manhom,
      nh.mahk,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.khoa, 
      mh.sotinchi,
      lh.maphong,
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
    JOIN phonghoc p   ON lh.maphong   = p.maphong
    JOIN giangvien gv ON nh.mgv       = gv.mgv
    ORDER BY lh.id DESC
  `;
  return db.query(sql);
};

exports.findById = id => {
  const sql = `
    SELECT 
      lh.id,
      lh.manhom,
      nh.mahk,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.khoa, 
      mh.sotinchi,
      lh.maphong,
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
    JOIN phonghoc p   ON lh.maphong   = p.maphong
    JOIN giangvien gv ON nh.mgv       = gv.mgv
    WHERE lh.id = ?
  `;
  return db.query(sql, [id]);
};

exports.findByGroup = manhom =>
  db.query(
    `
    SELECT 
      lh.id,
      nh.mahk,
      lh.manhom,
      lh.thu,
      lh.tietbd,
      lh.tietkt,
      lh.ngaybd,
      lh.ngaykt,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.sotinchi,
      mh.khoa,
      lh.maphong,
      p.tenphong,
      p.succhua,
      p.khu, 
      t.ten AS tengv
    FROM lichhoc lh
    JOIN nhommh nh    ON lh.manhom = nh.manhom
    JOIN monhoc mh    ON nh.mamh    = mh.mamh
    JOIN phonghoc p   ON lh.maphong = p.maphong
    JOIN giangvien t  ON nh.mgv     = t.mgv
    WHERE lh.manhom = ?
    ORDER BY lh.id
    `,
    [manhom]
  );
exports.create = ({ manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong }) =>
  db.query(
    `INSERT INTO lichhoc (manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong]
  );

// Thêm maphong vào update
exports.update = (id, { manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong }) =>
  db.query(
    `UPDATE lichhoc
       SET manhom = ?, thu = ?, tietbd = ?, tietkt = ?, ngaybd = ?, ngaykt = ?, maphong = ?
     WHERE id = ?`,
    [manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong, id]
  );
exports.remove = id =>
  db.query('DELETE FROM lichhoc WHERE id = ?', [id]);


// Lấy tất cả buổi học của một sinh viên theo msv
exports.findByStudentSchedules = (msv) => {
  const sql = `
    SELECT lh.id, lh.thu, lh.tietbd, lh.tietkt
    FROM dangky d
    JOIN lichhoc lh ON d.lichhoc_id = lh.id
    WHERE d.msv = ?
  `;
  return db.query(sql, [msv]);
};


exports.findByTeacher = (mgv) => {
  const sql = `
    SELECT 
      lh.id,
      lh.manhom,
      nh.mahk,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.khoa, 
      mh.sotinchi,
      lh.maphong,
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
    JOIN nhommh    nh ON lh.manhom   = nh.manhom
    JOIN monhoc    mh ON nh.mamh      = mh.mamh
    JOIN phonghoc  p  ON nh.maphong   = p.maphong
    JOIN giangvien gv ON nh.mgv       = gv.mgv
    WHERE nh.mgv = ?
    ORDER BY lh.id DESC
  `;
  return db.query(sql, [mgv]);
};


exports.findBySemester = mahk => {
  const sql = `
    SELECT 
      l.id,
      nh.mahk,
      l.manhom,
      nh.tennhom,
      nh.mamh,
      mh.tenmh,
      mh.khoa, 
      mh.sotinchi,
      l.maphong,
      p.tenphong,
      p.succhua,
      p.khu,
      nh.mgv,
      gv.ten AS tengv,
      l.thu,
      l.tietbd,
      l.tietkt,
      l.ngaybd,
      l.ngaykt
    FROM lichhoc l
    JOIN nhommh nh    ON l.manhom   = nh.manhom
    JOIN monhoc mh    ON nh.mamh      = mh.mamh
    JOIN phonghoc p   ON l.maphong   = p.maphong
    JOIN giangvien gv ON nh.mgv      = gv.mgv
    WHERE nh.mahk = ?
    ORDER BY l.thu, l.tietbd
  `;
  return db.query(sql, [mahk]);
};



exports.getCountGroupsBySemester = mahk =>
  db.query(
    `SELECT COUNT(*) AS count
     FROM lichhoc l
     JOIN nhommh nh ON l.manhom = nh.manhom
     WHERE nh.mahk = ?`,
    [mahk]
  );

exports.deleteBySemester = async (mahk) => {
  // 1) Xóa tất cả đăng ký thuộc học kỳ này
  await db.query(
    `DELETE d
     FROM dangky d
     JOIN lichhoc l    ON d.lichhoc_id = l.id
     JOIN nhommh nh    ON l.manhom      = nh.manhom
     WHERE nh.mahk = ?`,
    [mahk]
  );

  // 2) Xóa tất cả lịch học thuộc học kỳ này
  await db.query(
    `DELETE l
     FROM lichhoc l
     JOIN nhommh nh ON l.manhom = nh.manhom
     WHERE nh.mahk = ?`,
    [mahk]
  );
};