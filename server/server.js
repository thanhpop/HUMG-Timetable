// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON body

const PORT = 3001;

// --- CRUD routes ---

// 1. Lấy tất cả sinh viên
app.get('/students', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Lấy chi tiết một sinh viên theo id
app.get('/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Tạo mới sinh viên
app.post('/students', async (req, res) => {
    const { msv, name, khoa, lop, gender, dob } = req.body;
    if (!msv || !name || !khoa || !lop || !gender || !dob) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO students (msv,name,khoa,lop,gender,dob) VALUES (?,?,?,?,?,?)',
            [msv, name, khoa, lop, gender, dob]
        );
        const [newRow] = await db.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
        res.status(201).json(newRow[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Cập nhật sinh viên
app.put('/students/:id', async (req, res) => {
    const { msv, name, khoa, lop, gender, dob } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE students SET msv=?, name=?, khoa=?, lop=?, gender=?, dob=? WHERE id=?',
            [msv, name, khoa, lop, gender, dob, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Xóa sinh viên
app.delete('/students/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
