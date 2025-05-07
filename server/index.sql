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
  maphong   VARCHAR(50)   NOT NULL PRIMARY KEY,
  tenphong  VARCHAR(100) NOT NULL,
  khu       VARCHAR(100) NOT NULL,
  succhua   INT NOT NULL
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

CREATE TABLE IF NOT EXISTS dotdangky (
  id           INT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mahk         VARCHAR(50) NOT NULL,           -- học kỳ
  ngaybd_dk    DATE  NOT NULL,              -- bắt đầu đăng ký
  ngaykt_dk    DATE  NOT NULL,              -- kết thúc đăng ký
  FOREIGN KEY (mahk) REFERENCES hocky(mahk)
);






-- đừng lấy câu lệnh dưới này nhé

--truy vấn để lấy ra lịch học cho sinh viên đăng ký
SELECT
  l.id                   AS lichhoc_id,
  nh.manhom              AS mamon,           -- mã MH
  m.tenmh                AS tenmon,          -- tên môn
  nh.tennhom             AS tennhom,         -- tên nhóm MH
  l.thu,                                     -- thứ
  l.tietbd, l.tietkt,                       -- tiết bắt đầu/kết thúc
  m.sotinchi,                               -- số tín chỉ
  gv.ten                 AS giangvien,       -- tên giảng viên
  ph.tenphong            AS tenphong,        -- tên phòng
  ph.succhua             AS succhua,         -- sức chứa phòng
  COUNT(d.msv)           AS sv_dangky,       -- số SV đã đăng ký
  l.ngaybd, l.ngaykt                        -- ngày bắt đầu/kết thúc
FROM lichhoc l
JOIN nhommh nh   ON l.manhom = nh.manhom
JOIN monhoc m    ON nh.mamh   = m.mamh
JOIN giangvien gv ON nh.mgv   = gv.mgv
JOIN phonghoc ph ON nh.maphong= ph.maphong
LEFT JOIN dangky d ON l.id      = d.lichhoc_id
GROUP BY l.id
ORDER BY l.thu, l.tietbd;

-- danh sách các môn sv đã đăng ký
SELECT
  d.msv,
  l.id         AS lichhoc_id,
  nh.mamh      AS mamh,
  m.tenmh      AS tenmh,
  nh.tennhom   AS tennhom,
  l.thu, l.tietbd, l.tietkt,
  ph.tenphong,
  d.ngaydk
FROM dangky d
JOIN lichhoc l    ON d.lichhoc_id = l.id
JOIN nhommh nh    ON l.manhom = nh.manhom
JOIN monhoc m     ON nh.mamh  = m.mamh
JOIN phonghoc ph  ON nh.maphong = ph.maphong
WHERE d.msv = 'SV001';



