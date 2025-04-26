// controllers/teacherController.js
const Teacher = require('../models/teacherModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Teacher.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Teacher.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { mgv, ten, khoa, email, sdt, gioitinh } = req.body;
        if (!mgv || !ten || !khoa) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const [result] = await Teacher.create({ mgv, ten, khoa, email, sdt, gioitinh });
        const [[newRow]] = await Teacher.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { mgv, ten, khoa, email, sdt, gioitinh } = req.body;
        const [result] = await Teacher.update(req.params.id, { mgv, ten, khoa, email, sdt, gioitinh });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Teacher.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Teacher.remove(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
