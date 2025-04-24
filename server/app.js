// app.js
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/students');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// mount student API
app.use('/students', studentRoutes);

// middleware xử lý 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;
