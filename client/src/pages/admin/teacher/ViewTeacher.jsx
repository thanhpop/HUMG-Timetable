import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacher } from '../../../api/teacherApi';
import '../student/style.css';

export default function ViewTeacher() {
    const { id } = useParams(), nav = useNavigate();
    const [tec, setTec] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await getTeacher(id);
            setTec(res.data);
        })();
    }, [id]);

    if (!tec) return <div>Loading…</div>;

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết Giáo viên</h2>
                <div className="view-content">
                    <p><strong>Mã GV:</strong> {tec.mgv}</p>
                    <p><strong>Họ và tên:</strong> {tec.ten}</p>
                    <p><strong>Bộ môn:</strong> {tec.khoa}</p>
                    <p><strong>Giới tính:</strong> {tec.gioitinh}</p>
                    <p><strong>Email:</strong> {tec.email}</p>
                    <p><strong>SĐT:</strong> {tec.sdt}</p>

                </div>
                <button className="btn btn-secondary" onClick={() => nav(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
