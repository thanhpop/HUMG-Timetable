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


CREATE TABLE IF NOT EXISTS phonghoc (
  maphong   VARCHAR(50)   NOT NULL PRIMARY KEY,
  tenphong  VARCHAR(100) NOT NULL,
  khu       VARCHAR(100) NOT NULL,
  soluong   INT NOT NULL
);

CREATE TABLE IF NOT EXISTS hocky (
  mahk      VARCHAR(50)   NOT NULL,
  tenhk     VARCHAR(100)  NOT NULL,
  namhoc    VARCHAR(15)   NOT NULL,
  ngaybd    DATE          NOT NULL,
  ngaykt    DATE          NOT NULL,
  PRIMARY KEY (mahk),
  UNIQUE KEY uq_mahk (mahk)
);



CREATE TABLE IF NOT EXISTS taikhoan ( 
  id        INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(50)    NOT NULL UNIQUE,
  password  VARCHAR(255)   NOT NULL,
  vaitro    ENUM('admin','gv','sv') NOT NULL
);

CREATE TABLE IF NOT EXISTS nhommh (
  manhom      VARCHAR(50)   NOT NULL PRIMARY KEY,
  tennhom     VARCHAR(150)  NOT NULL,
  mamh        VARCHAR(50)   NOT NULL,
  mgv         VARCHAR(50)   NOT NULL,
  maphong     VARCHAR(50)   NOT NULL,
  soluongsv   INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (mamh)    REFERENCES monhoc(mamh),
  FOREIGN KEY (mgv)     REFERENCES giangvien(mgv),
  FOREIGN KEY (maphong) REFERENCES phonghoc(maphong)
)
