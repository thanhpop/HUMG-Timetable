// controllers/groupController.js
const Group = require('../models/groupModel');

// Hàm helper kiểm tra xem một manhom có tồn tại chưa
async function existsManhom(manhom) {
    const [rows] = await Group.findById(manhom);
    return rows.length > 0;
}

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Group.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Group.findById(req.params.manhom);
        if (!rows.length) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { manhom, tennhom, mamh, mgv, mahk } = req.body;
        if (!manhom || !tennhom || !mamh || !mgv || !mahk) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Kiểm tra manhom đã tồn tại chưa
        const already = await existsManhom(manhom);
        if (already) {
            return res.status(400).json({ error: 'Mã nhóm đã tồn tại' });
        }

        const [result] = await Group.create({ manhom, tennhom, mamh, mgv, mahk });
        const [[newRow]] = await Group.findById(manhom);
        res.status(201).json(newRow);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã nhóm đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const oldManhom = req.params.manhom;
        const { newManhom, tennhom, mamh, mgv, mahk } = req.body;

        // Nếu muốn đổi manhom, kiểm tra tính duy nhất
        if (newManhom && newManhom !== oldManhom) {
            const already = await existsManhom(newManhom);
            if (already) {
                return res.status(400).json({ error: `Mã nhóm "${newManhom}" đã tồn tại. Vui lòng chọn mã khác.` });
            }
        }

        // Gọi model.update (đã nhận oldManhom và payload gồm newManhom)
        const [result] = await Group.update(oldManhom, { newManhom, tennhom, mamh, mgv, mahk });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Sau khi update, chọn lookupManhom để lấy bản ghi mới
        const lookupManhom = (newManhom && newManhom !== oldManhom) ? newManhom : oldManhom;
        const [[updatedRow]] = await Group.findById(lookupManhom);

        res.json(updatedRow);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã nhóm đã tồn tại' });
        }
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Group.remove(req.params.manhom);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
