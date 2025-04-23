-- code query MySQL
CREATE DATABASE IF NOT EXISTS timetable;
USE timetable;

CREATE TABLE IF NOT EXISTS students (
  id        INT         AUTO_INCREMENT PRIMARY KEY,
  msv       VARCHAR(50) NOT NULL,
  name      VARCHAR(100) NOT NULL,
  khoa      VARCHAR(100) NOT NULL,
  lop       VARCHAR(50)  NOT NULL,
  gender    ENUM('Nam','Nữ') NOT NULL,
  dob       DATE        NOT NULL,

);
