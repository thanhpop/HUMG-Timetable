// src/pages/admin/student/ViewStudent.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent } from '../../../api/studentApi';
import '../style.css';
export default function ViewStudent() {
    const { msv } = useParams();
    const navigate = useNavigate();
    const [stu, setStu] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await getStudent(msv);
            setStu(res.data);
        })();
    }, [msv]);

    if (!stu) return <div>Loading…</div>;

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết thông tin sinh viên</h2>
                <div className="view-content">
                    <p><strong>MSV:</strong> {stu.msv}</p>
                    <p><strong>Họ và tên:</strong> {stu.ten}</p>
                    <p><strong>Khoa:</strong> {stu.khoa}</p>
                    <p><strong>Khóa:</strong> {stu.khoaHoc}</p>
                    <p><strong>Lớp:</strong> {stu.lop}</p>
                    <p><strong>Giới tính:</strong> {stu.gioitinh}</p>
                    <p><strong>Ngày sinh:</strong> {new Date(stu.ngaysinh).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Số ĐT:</strong> {stu.sdt}</p>
                    <p><strong>Email:</strong> {stu.email}</p>
                    <p><strong>CCCD:</strong> {stu.cccd}</p>
                    <p><strong>Địa chỉ:</strong> {stu.diachi}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
