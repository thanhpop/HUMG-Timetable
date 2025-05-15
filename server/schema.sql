
ALTER TABLE monhoc
ADD COLUMN loaiphong VARCHAR(20) NULL;

ALTER TABLE phonghoc
ADD COLUMN loaiphong VARCHAR(20) NULL;

ALTER TABLE nhommh
ADD COLUMN siso_toida INT NOT NULL DEFAULT 30;

ALTER TABLE dangky
ADD COLUMN trangthai ENUM('Cho duyet', 'Da duyet', 'Huy') NOT NULL DEFAULT 'Cho duyet';

ALTER TABLE sinhvien 
ADD CONSTRAINT chk_sinhvien_email 
CHECK (email IS NULL OR email LIKE '%@%.%');

ALTER TABLE sinhvien
ADD CONSTRAINT chk_sinhvien_ngaysinh
CHECK (ngaysinh <= CURRENT_DATE());

ALTER TABLE giangvien
ADD CONSTRAINT chk_giangvien_email
CHECK (email IS NULL OR email LIKE '%@%.%');

ALTER TABLE monhoc
ADD CONSTRAINT chk_monhoc_sotinchi
CHECK (sotinchi BETWEEN 1 AND 4);

ALTER TABLE phonghoc
ADD CONSTRAINT chk_phonghoc_succhua
CHECK (succhua > 0);

ALTER TABLE hocky
ADD CONSTRAINT chk_hocky_ngay
CHECK (ngaykt > ngaybd);

ALTER TABLE lichhoc
ADD CONSTRAINT chk_lichhoc_thu
CHECK (thu BETWEEN 2 AND 8);

ALTER TABLE lichhoc
ADD CONSTRAINT chk_lichhoc_tiet
CHECK (tietbd BETWEEN 1 AND 13 AND tietkt BETWEEN 1 AND 13 AND tietkt >= tietbd);

ALTER TABLE lichhoc
ADD CONSTRAINT chk_lichhoc_ngay
CHECK (ngaykt >= ngaybd);

ALTER TABLE dotdangky
ADD CONSTRAINT chk_dotdangky_ngay
CHECK (ngaykt_dk >= ngaybd_dk);

ALTER TABLE sinhvien
ADD CONSTRAINT unq_sinhvien_cccd
UNIQUE (cccd);

ALTER TABLE hocky
ADD CONSTRAINT unq_hocky_namhoc_tenhk
UNIQUE (namhoc, tenhk);

DELIMITER //

CREATE TRIGGER before_lichhoc_insert BEFORE INSERT ON lichhoc
FOR EACH ROW
BEGIN
    DECLARE phong_trong INT;
    DECLARE gv_trong INT;
    DECLARE ngay_hk_bd DATE;
    DECLARE ngay_hk_kt DATE;
    DECLARE loaiphong_mh VARCHAR(20);
    DECLARE loaiphong_ph VARCHAR(20);
    
    SELECT m.loaiphong INTO loaiphong_mh 
    FROM monhoc m JOIN nhommh n ON m.mamh = n.mamh 
    WHERE n.manhom = NEW.manhom;
    
    SELECT p.loaiphong INTO loaiphong_ph
    FROM phonghoc p JOIN nhommh n ON p.maphong = n.maphong
    WHERE n.manhom = NEW.manhom;
    
    IF loaiphong_mh != loaiphong_ph THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Loại phòng không phù hợp với loại môn học';
    END IF;
    
    SELECT COUNT(*) INTO phong_trong
    FROM lichhoc l
    JOIN nhommh n ON l.manhom = n.manhom
    WHERE n.maphong = (SELECT maphong FROM nhommh WHERE manhom = NEW.manhom)
    AND l.thu = NEW.thu
    AND ((NEW.tietbd BETWEEN l.tietbd AND l.tietkt) OR (NEW.tietkt BETWEEN l.tietbd AND l.tietkt))
    AND ((NEW.ngaybd BETWEEN l.ngaybd AND l.ngaykt) OR (NEW.ngaykt BETWEEN l.ngaybd AND l.ngaykt));
    
    IF phong_trong > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Phòng học đã có lịch trong khoảng thời gian này';
    END IF;
    
    SELECT COUNT(*) INTO gv_trong
    FROM lichhoc l
    JOIN nhommh n ON l.manhom = n.manhom
    WHERE n.mgv = (SELECT mgv FROM nhommh WHERE manhom = NEW.manhom)
    AND l.thu = NEW.thu
    AND ((NEW.tietbd BETWEEN l.tietbd AND l.tietkt) OR (NEW.tietkt BETWEEN l.tietbd AND l.tietkt))
    AND ((NEW.ngaybd BETWEEN l.ngaybd AND l.ngaykt) OR (NEW.ngaykt BETWEEN l.ngaybd AND l.ngaykt));
    
    IF gv_trong > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Giảng viên đã có lịch trong khoảng thời gian này';
    END IF;
    
    SELECT h.ngaybd, h.ngaykt INTO ngay_hk_bd, ngay_hk_kt 
    FROM hocky h
    JOIN nhommh n ON h.mahk = n.mahk
    WHERE n.manhom = NEW.manhom;
    
    IF NEW.ngaybd < ngay_hk_bd OR NEW.ngaykt > ngay_hk_kt THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Ngày học không nằm trong học kỳ';
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER before_dangky_insert BEFORE INSERT ON dangky
FOR EACH ROW
BEGIN
    DECLARE siso_hientai INT;
    DECLARE siso_toida INT;
    
    SELECT COUNT(*), n.siso_toida INTO siso_hientai, siso_toida
    FROM dangky d
    JOIN lichhoc l ON d.lichhoc_id = l.id
    JOIN nhommh n ON l.manhom = n.manhom
    WHERE l.id = NEW.lichhoc_id
    GROUP BY n.manhom;
    
    IF siso_hientai >= siso_toida THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Nhóm học đã đạt sĩ số tối đa';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM dangky d
        JOIN lichhoc l ON d.lichhoc_id = l.id
        WHERE d.msv = NEW.msv AND l.manhom = (
            SELECT manhom FROM lichhoc WHERE id = NEW.lichhoc_id
        )
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Sinh viên đã đăng ký nhóm này';
    END IF;
END//

DELIMITER ;

CREATE VIEW vw_thoikhoabieu AS
SELECT 
    n.manhom,
    m.tenmh,
    m.sotinchi,
    g.ten AS tengv,
    p.tenphong,
    p.khu,
    l.thu,
    l.tietbd,
    l.tietkt,
    l.ngaybd,
    l.ngaykt,
    COUNT(d.id) AS siso_hientai,
    n.siso_toida
FROM nhommh n
JOIN monhoc m ON n.mamh = m.mamh
JOIN giangvien g ON n.mgv = g.mgv
LEFT JOIN phonghoc p ON n.maphong = p.maphong
JOIN lichhoc l ON n.manhom = l.manhom
LEFT JOIN dangky d ON l.id = d.lichhoc_id AND d.trangthai = 'Da duyet'
GROUP BY n.manhom, l.id;

CREATE TABLE IF NOT EXISTS lichsu_tkb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manhom VARCHAR(50) NOT NULL,
    thoigian DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hanhdong ENUM('Them', 'Sua', 'Xoa') NOT NULL,
    noidung TEXT NOT NULL,
    nguoithuchien VARCHAR(50) NOT NULL,
    FOREIGN KEY (manhom) REFERENCES nhommh(manhom)
);

DELIMITER //

CREATE TRIGGER after_lichhoc_insert AFTER INSERT ON lichhoc
FOR EACH ROW
BEGIN
    INSERT INTO lichsu_tkb (manhom, hanhdong, noidung, nguoithuchien)
    VALUES (
        NEW.manhom,
        'Them',
        CONCAT('Thêm lịch học: Thứ ', NEW.thu, ', Tiết ', NEW.tietbd, '-', NEW.tietkt, 
               ', Từ ', NEW.ngaybd, ' đến ', NEW.ngaykt),
        CURRENT_USER()
    );
END//

CREATE TRIGGER after_lichhoc_update AFTER UPDATE ON lichhoc
FOR EACH ROW
BEGIN
    INSERT INTO lichsu_tkb (manhom, hanhdong, noidung, nguoithuchien)
    VALUES (
        NEW.manhom,
        'Sua',
        CONCAT('Sửa lịch học: Thứ ', OLD.thu, '->', NEW.thu, 
               ', Tiết ', OLD.tietbd, '-', OLD.tietkt, '->', NEW.tietbd, '-', NEW.tietkt,
               ', Ngày ', OLD.ngaybd, '-', OLD.ngaykt, '->', NEW.ngaybd, '-', NEW.ngaykt),
        CURRENT_USER()
    );
END//

CREATE TRIGGER after_lichhoc_delete AFTER DELETE ON lichhoc
FOR EACH ROW
BEGIN
    INSERT INTO lichsu_tkb (manhom, hanhdong, noidung, nguoithuchien)
    VALUES (
        OLD.manhom,
        'Xoa',
        CONCAT('Xóa lịch học: Thứ ', OLD.thu, ', Tiết ', OLD.tietbd, '-', OLD.tietkt,
               ', Từ ', OLD.ngaybd, ' đến ', OLD.ngaykt),
        CURRENT_USER()
    );
END//

DELIMITER ;
