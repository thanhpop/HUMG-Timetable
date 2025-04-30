// app.js
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const roomRoutes = require('./routes/rooms');
const semesterRoutes = require('./routes/semesters');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groupRoutes');

const lichhocRoutes = require('./routes/lichhoc');

const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/courses', courseRoutes);
app.use('/rooms', roomRoutes);
app.use('/semesters', semesterRoutes);

app.use('/nhommh', groupRoutes);
app.use('/users', userRoutes);

app.use('/lichhoc', lichhocRoutes);


app.use('/auth', authRoutes);


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


app.use(errorHandler);

module.exports = app;
