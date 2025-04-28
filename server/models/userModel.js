// models/userModel.js
const db = require('../config/db');
const User = {
    findByUsername: username =>
        db.query('SELECT * FROM taikhoan WHERE username = ?', [username]),

    findAll: () =>
        db.query('SELECT id, username, password, vaitro FROM taikhoan ORDER BY id DESC'),

    findById: id =>
        db.query('SELECT id, username, password, vaitro FROM taikhoan WHERE id = ?', [id]),

    create: ({ username, password, vaitro }) =>
        db.query(
            'INSERT INTO taikhoan (username,password,vaitro) VALUES (?,?,?)',
            [username, password, vaitro]
        ),

    update: (id, { password, vaitro }) =>
        db.query(
            password
                ? 'UPDATE taikhoan SET password=?, vaitro=? WHERE id=?'
                : 'UPDATE taikhoan SET vaitro=? WHERE id=?',
            password
                ? [password, vaitro, id]
                : [vaitro, id]
        ),

    remove: id =>
        db.query('DELETE FROM taikhoan WHERE id = ?', [id]),

    //--- hai hàm mới để lấy profile sinh viên/giảng viên
    findStudentByMsv: msv =>
        db.query('SELECT * FROM sinhvien WHERE msv = ?', [msv]),

    findLecturerByMgv: mgv =>
        db.query('SELECT * FROM giangvien WHERE mgv = ?', [mgv]),
};

module.exports = User;