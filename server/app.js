// app.js
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/courses', courseRoutes);


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


app.use(errorHandler);

module.exports = app;
