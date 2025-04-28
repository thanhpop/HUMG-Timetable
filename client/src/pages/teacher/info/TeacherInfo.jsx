import React, { useState, useEffect } from 'react';
import './TeacherInfo.css';

const TeacherInfo = () => {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setProfile(user.profile || {});
    }
  }, []);
  //  truyền props
  return (
    <div className="lecturer-info-page">
      <div className="lecturer-info-container">
        <section className="infolec-section">
          <h1>Thông tin giảng viên</h1>
          <div className="infolec-grid">
            <div><strong>Mã giảng viên:</strong><span>{profile.mgv || 'N/A'}</span> </div>
            <div><strong>Họ và tên:</strong><span>{profile.ten || 'N/A'}</span> </div>
            <div><strong>Khoa:</strong><span>{profile.khoa || 'N/A'}</span> </div>
            <div><strong>Email:</strong><span>{profile.email || 'N/A'}</span></div>
            <div><strong>Điện thoại:</strong> <span>{profile.sdt || 'N/A'}</span></div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherInfo;
