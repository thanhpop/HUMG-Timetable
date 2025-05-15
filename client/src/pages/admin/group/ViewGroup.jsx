// src/pages/admin/group/ViewGroup.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroup } from '../../../api/groupApi';
import {
    getAllCourses,
    getAllTeachers,
    getAllSemesters
} from '../../../api/utilsApi';
import '../style.css';

export default function ViewGroup() {
    const { manhom } = useParams();
    const nav = useNavigate();

    const [g, setG] = useState(null);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [groupRes, courseRes, teacherRes, roomRes, semRes] = await Promise.all([
                    getGroup(manhom),
                    getAllCourses(),
                    getAllTeachers(),
                    getAllSemesters()
                ]);
                setG(groupRes.data);
                setCourses(courseRes.data);
                setTeachers(teacherRes.data);
                setSemesters(semRes.data);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
            }
        })();
    }, [manhom]);

    if (!g) return <div>Loading…</div>;

    const course = courses.find(c => c.mamh === g.mamh);
    const teacher = teachers.find(t => t.mgv === g.mgv);
    const semester = semesters.find(s => s.mahk === g.mahk);

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết Nhóm</h2>
                <div className="view-content">
                    <p><strong>Mã nhóm:</strong> {g.manhom}</p>
                    <p><strong>Tên nhóm:</strong> {g.tennhom}</p>
                    <p>
                        <strong>Môn học:</strong> {g.mamh} — {course?.tenmh || 'Không tìm thấy'}
                    </p>
                    <p>
                        <strong>Giảng viên:</strong> {g.mgv} — {teacher?.ten || 'Không tìm thấy'}
                    </p>
                    <p>
                        <strong>Học kỳ:</strong> {g.mahk} — {semester?.tenhk || 'Không tìm thấy'}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => nav(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
