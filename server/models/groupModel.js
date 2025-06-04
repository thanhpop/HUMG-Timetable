const db = require('../config/db');

// Lấy tất cả nhóm
exports.findAll = () =>
    db.query(`
   SELECT nhommh.*
        FROM nhommh
        ORDER BY nhommh.manhom
    `);

// Tìm theo mã nhóm
exports.findById = manhom =>
    db.query(`
        SELECT nhommh.*
        FROM nhommh
        WHERE nhommh.manhom = ?
    `, [manhom]);

// Thêm nhóm mới
exports.create = ({ manhom, tennhom, mamh, mgv, mahk }) =>
    db.query(
        'INSERT INTO nhommh (manhom, tennhom, mamh, mgv, mahk) VALUES (?, ?, ?, ?, ?)',
        [manhom, tennhom, mamh, mgv, mahk]
    );

// Cập nhật nhóm
exports.update = (oldManhom, { newManhom, tennhom, mamh, mgv, mahk }) => {
    const manhomToSet = newManhom || oldManhom;
    return db.query(
        `UPDATE nhommh
     SET manhom  = ?,
         tennhom = ?,
         mamh    = ?,
         mgv     = ?,
         mahk    = ?
     WHERE manhom = ?`,
        [manhomToSet, tennhom, mamh, mgv, mahk, oldManhom]
    );
};
// Xóa nhóm
exports.remove = manhom =>
    db.query('DELETE FROM nhommh WHERE manhom = ?', [manhom]);
