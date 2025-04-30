// server/controllers/lichhocController.js
const Schedule = require('../models/lichhocModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt } = req.body;
        // simple validation
        if (!manhom || thu == null || tietbd == null || tietkt == null || !ngaybd || !ngaykt) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const [result] = await Schedule.create({ manhom, thu, tietbd, tietkt, ngaybd, ngaykt });
        const [[newRow]] = await Schedule.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt } = req.body;
        const [result] = await Schedule.update(req.params.id, { manhom, thu, tietbd, tietkt, ngaybd, ngaykt });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Schedule.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Schedule.remove(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};