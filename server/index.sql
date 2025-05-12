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

);

CREATE TABLE IF NOT EXISTS giangvien (
  mgv      VARCHAR(50)    NOT NULL,
  ten      VARCHAR(100)   NOT NULL,
  khoa     VARCHAR(100)   NOT NULL,
  email    VARCHAR(150) NULL,
  sdt      VARCHAR(20) NULL,
  gioitinh ENUM('Nam','Nữ') NOT NULL, 
  PRIMARY KEY (mgv),
  
);
CREATE TABLE IF NOT EXISTS monhoc (
  mamh      VARCHAR(50)   NOT NULL,
  tenmh     VARCHAR(150)  NOT NULL,
  sotinchi  INT           NOT NULL,
  khoa      VARCHAR(100)  NOT NULL,
  PRIMARY KEY (mamh),
    
);



CREATE TABLE IF NOT EXISTS phonghoc (
  maphong   VARCHAR(50)   NOT NULL ,
  tenphong  VARCHAR(100) NOT NULL,
  khu       VARCHAR(100) NOT NULL,
  succhua   INT NOT NULL
  PRIMARY KEY (maphong),
);


CREATE TABLE IF NOT EXISTS hocky (
  mahk      VARCHAR(50)   NOT NULL,
  tenhk     VARCHAR(100)  NOT NULL,
  namhoc    VARCHAR(15)   NOT NULL,
  ngaybd    DATE          NOT NULL,
  ngaykt    DATE          NOT NULL,
  PRIMARY KEY (mahk),

);



CREATE TABLE IF NOT EXISTS taikhoan ( 
  id        INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(50)    NOT NULL UNIQUE,
  password  VARCHAR(255)   NOT NULL,
  vaitro    ENUM('admin','gv','sv') NOT NULL
);

-- nhóm môn học
CREATE TABLE IF NOT EXISTS nhommh (
  manhom      VARCHAR(50)   NOT NULL PRIMARY KEY,
  tennhom     VARCHAR(150)  NOT NULL,
  mamh        VARCHAR(50)   NOT NULL,
  mgv         VARCHAR(50)   NOT NULL,
  maphong     VARCHAR(50)   NOT NULL,
  mahk VARCHAR(50) NOT NULL,
  FOREIGN KEY (mamh)    REFERENCES monhoc(mamh),
  FOREIGN KEY (mgv)     REFERENCES giangvien(mgv),
  FOREIGN KEY (maphong) REFERENCES phonghoc(maphong),
  FOREIGN KEY (mahk) REFERENCES hocky(mahk);
);



CREATE TABLE IF NOT EXISTS lichhoc (
  id           INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  manhom       VARCHAR(50)    NOT NULL,
  thu          TINYINT        NOT NULL,      -- 2=Thứ 2 ... 8=Chủ nhật
  tietbd       TINYINT        NOT NULL,      -- tiết bắt đầu
  tietkt       TINYINT        NOT NULL,      -- tiết kết thúc
  ngaybd       DATE           NOT NULL,      -- ngày bắt đầu học
  ngaykt       DATE           NOT NULL,      -- ngày kết thúc học
  FOREIGN KEY (manhom) REFERENCES nhommh(manhom)
);

-- 2. Bảng dangky: lưu sinh viên đăng ký cho từng buổi học
CREATE TABLE IF NOT EXISTS dangky (
  id           INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  msv          VARCHAR(50)    NOT NULL,
  lichhoc_id   INT            NOT NULL,
  ngaydk       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (msv)        REFERENCES sinhvien(msv),
  FOREIGN KEY (lichhoc_id) REFERENCES lichhoc(id)
);

-- 3. Bảng dotdangky: lưu thông tin các đợt đăng ký học phần
CREATE TABLE IF NOT EXISTS dotdangky (
  id           INT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mahk         VARCHAR(50) NOT NULL,           -- học kỳ
  ngaybd_dk    DATE  NOT NULL,              -- bắt đầu đăng ký
  ngaykt_dk    DATE  NOT NULL,              -- kết thúc đăng ký
  FOREIGN KEY (mahk) REFERENCES hocky(mahk)
);








