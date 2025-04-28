// controllers/authController.js
const User = require('../models/userModel');
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // look up user by username
        const [acctRows] = await User.findByUsername(username);
        if (!acctRows.length) {
            return res.status(400).json({ error: 'Sai username hoặc mật khẩu' });
        }
        const acct = acctRows[0];
        if (acct.password !== password) {
            return res.status(400).json({ error: 'Sai username hoặc mật khẩu' });
        }

        // 2. Tạo object kết quả, luôn có id, username, vaitro
        const user = {
            id: acct.id,
            username: acct.username,
            vaitro: acct.vaitro,
        };

        // 3. Tùy role, truy vấn thêm thông tin từ sinhvien hoặc giangvien
        if (acct.vaitro === 'sv') {
            const [stuRows] = await User.findStudentByMsv(acct.username);
            if (stuRows.length) {
                user.profile = {
                    msv: stuRows[0].msv,
                    ten: stuRows[0].ten,
                    khoa: stuRows[0].khoa,
                    lop: stuRows[0].lop,
                    gioitinh: stuRows[0].gioitinh,
                    ngaysinh: stuRows[0].ngaysinh,
                    // ...các trường khác nếu cần
                };
            }
        } else if (acct.vaitro === 'gv') {
            const [lecRows] = await User.findLecturerByMgv(acct.username);
            if (lecRows.length) {
                user.profile = {
                    mgv: lecRows[0].mgv,
                    ten: lecRows[0].ten,
                    khoa: lecRows[0].khoa,
                    email: lecRows[0].email,
                    sdt: lecRows[0].sdt,
                    gioitinh: lecRows[0].gioitinh,
                };
            }
        }


        // on success, return user object
        res.json({ user });
    } catch (err) {
        next(err);
    }
};
