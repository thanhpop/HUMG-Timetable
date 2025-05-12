import React, { useState, useEffect } from 'react';
import './StudentInfo.css';

const StudentInfo = () => {
  // truyền dữ liệu từ props hoặc API
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setProfile(user.profile || {});
    }
  }, []);
  return (
    <div className="student-info-page">
      <div className="student-info-container">
        <section className="info-section">
          <h1>Thông tin sinh viên</h1>
          <div className="info-grid">
            <div><strong>Mã sinh viên:</strong><span>{profile.msv || ''}</span> </div>
            <div><strong>Họ và tên:</strong><span>{profile.ten || ''}</span></div>
            <div><strong>Khoa:</strong><span>{profile.khoa || ''}</span></div>
            <div><strong>Lớp:</strong><span>{profile.lop || ''}</span></div>
            <div><strong>Giới tính:</strong><span>{profile.gioitinh || ''}</span></div>
            <div><strong>Ngày sinh:</strong><span>{profile.ngaysinh
              ? new Date(profile.ngaysinh).toLocaleDateString('vi-VN')
              : ''}</span> </div>
            <div><strong>Điện thoại:</strong><span>{profile.sdt || ''}</span></div>
            <div><strong>Email:</strong><span>{profile.email || ''}</span></div>
            <div><strong>Số CCCD:</strong><span>{profile.cccd || ''}</span></div>
            <div><strong>Địa chỉ:</strong><span>{profile.diachi || ''}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentInfo;
