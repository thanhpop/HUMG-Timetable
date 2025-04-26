-- code query MySQL
CREATE DATABASE IF NOT EXISTS timetable;
USE timetable;

CREATE TABLE IF NOT EXISTS students (
  id        INT         AUTO_INCREMENT PRIMARY KEY,
  msv       VARCHAR(50) NOT NULL,
  ten      VARCHAR(100) NOT NULL,
  khoa      VARCHAR(100) NOT NULL,
  lop       VARCHAR(50)  NOT NULL,
  gioitinh    ENUM('Nam','Nữ') NOT NULL,
  ngaysinh       DATE        NOT NULL,
  sdt VARCHAR(20)  NULL,
  email VARCHAR(255) NULL, 
  cccd VARCHAR(20) NULL,
  diachi VARCHAR(255) NULL,
  UNIQUE KEY idx_msv (msv) 
);

CREATE TABLE IF NOT EXISTS teachers (
  id           INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mgv    VARCHAR(50) NOT NULL,
  ten         VARCHAR(100) NOT NULL,
  khoa   VARCHAR(100) NOT NULL,
  email        VARCHAR(150),
  sdt        VARCHAR(20),
  gioitinh ENUM('Nam','Nữ') NULL,
  UNIQUE KEY idx_mgv (mgv)
);
