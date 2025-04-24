// db.js — thiết lập pool kết nối MySQL
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',    // hoặc IP, hoặc container name
    user: 'root',
    password: '',
    database: 'timetable',
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool.promise();
