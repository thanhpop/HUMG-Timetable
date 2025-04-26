-- code query MySQL
CREATE DATABASE IF NOT EXISTS timetable;
USE timetable;

CREATE TABLE IF NOT EXISTS sinhvien (
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
  PRIMARY KEY (msv),
  UNIQUE KEY idx_msv (msv) 
);

CREATE TABLE IF NOT EXISTS giangvien (
  mgv      VARCHAR(50)    NOT NULL,
  ten      VARCHAR(100)   NOT NULL,
  khoa     VARCHAR(100)   NOT NULL,
  email    VARCHAR(150) NULL,
  sdt      VARCHAR(20) NULL,
  gioitinh ENUM('Nam','Nữ') NOT NULL, 
  PRIMARY KEY (mgv),
  UNIQUE KEY idx_mgv (mgv)     
)
CREATE TABLE IF NOT EXISTS monhoc (
  mamh      VARCHAR(50)   NOT NULL,
  tenmh     VARCHAR(150)  NOT NULL,
  sotinchi  INT           NOT NULL,
  khoa      VARCHAR(100)  NOT NULL,
  PRIMARY KEY (mamh),
  UNIQUE KEY idx_mamh (mamh)     
)
