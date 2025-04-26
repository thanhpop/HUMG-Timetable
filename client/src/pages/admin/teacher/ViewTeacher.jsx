// src/pages/admin/teacher/ViewTeacher.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacher } from '../../../api/teacherApi';
import '../style.css';

export default function ViewTeacher() {
    const { mgv } = useParams();    // ← dùng mgv
    const navigate = useNavigate();
    const [tec, setTec] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await getTeacher(mgv);  // ← truyền mgv
            setTec(res.data);
        })();
    }, [mgv]);

    if (!tec) return <div>Loading…</div>;

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết Giảng viên</h2>
                <div className="view-content">
                    <p><strong>Mã GV:</strong> {tec.mgv}</p>
                    <p><strong>Họ và tên:</strong> {tec.ten}</p>
                    <p><strong>Bộ môn:</strong> {tec.khoa}</p>
                    <p><strong>Giới tính:</strong> {tec.gioitinh}</p>
                    <p><strong>Email:</strong> {tec.email}</p>
                    <p><strong>SĐT:</strong> {tec.sdt}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Quay lại
                </button>
            </div>
        </div>
    );
}
