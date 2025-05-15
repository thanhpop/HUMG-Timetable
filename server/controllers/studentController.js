// controllers/studentController.js
const Student = require('../models/studentModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Student.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Student.findById(req.params.msv);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { msv, ten, khoa, lop, khoaHoc, gioitinh, ngaysinh, sdt, email, cccd, diachi } = req.body;
        const [result] = await Student.create({ msv, ten, khoa, lop, khoaHoc, gioitinh, ngaysinh, sdt, email, cccd, diachi });
        const [newRow] = await Student.findById(result.insertId);
        res.status(201).json(newRow[0]);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { msv, ten, khoa, lop, khoaHoc, gioitinh, ngaysinh, sdt, email, cccd, diachi } = req.body;
        const [result] = await Student.update(req.params.msv, { msv, ten, khoa, lop, khoaHoc, gioitinh, ngaysinh, sdt, email, cccd, diachi });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [rows] = await Student.findById(req.params.msv);
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Student.remove(req.params.msv);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
