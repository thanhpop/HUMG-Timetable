// src/pages/admin/course/AddCourse.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createCourse } from '../../../api/courseApi';
import '../style.css';

export default function AddCourse() {
    const navigate = useNavigate();
    const { courses, setCourses } = useOutletContext();   // lấy mảng courses từ context

    const [form, setForm] = useState({
        mamh: '',
        tenmh: '',
        sotinchi: '',
        khoa: ''
    });
    const [error, setError] = useState('');

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'mamh') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        // kiểm tra trùng mã môn học
        if (courses.some(c => c.mamh === form.mamh)) {
            setError(`Mã môn học "${form.mamh}" đã tồn tại!`);
            return;
        }
        // gọi API tạo mới
        const res = await createCourse(form);
        setCourses([res.data, ...courses]);
        navigate('/admin/courses');
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2 className="form-title">Thêm Môn học</h2>
                <form onSubmit={onSubmit} className="two-column-form">
                    {/* Mã môn học */}
                    <label htmlFor="mamh">Mã môn học*</label>
                    <input
                        id="mamh"
                        name="mamh"
                        type="text"
                        value={form.mamh}
                        onChange={onInput}
                        required
                    />
                    {error && <div className="error-message">{error}</div>}

                    {/* Tên môn học */}
                    <label htmlFor="tenmh">Tên môn học*</label>
                    <input
                        id="tenmh"
                        name="tenmh"
                        type="text"
                        value={form.tenmh}
                        onChange={onInput}
                        required
                    />

                    {/* Số tín chỉ */}
                    <label htmlFor="sotinchi">Số tín chỉ*</label>
                    <input
                        id="sotinchi"
                        name="sotinchi"
                        type="number"
                        min="1"
                        value={form.sotinchi}
                        onChange={onInput}
                        required
                    />

                    {/* Khoa */}
                    <label htmlFor="khoa">Khoa*</label>
                    <input
                        id="khoa"
                        name="khoa"
                        type="text"
                        value={form.khoa}
                        onChange={onInput}
                        required
                    />

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Thêm</button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}

                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
