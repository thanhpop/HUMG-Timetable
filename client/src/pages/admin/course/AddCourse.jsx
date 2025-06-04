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
                    <label htmlFor="mamh">Mã môn học<span style={{ color: 'red' }}>(*)</span></label>
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
                    <label htmlFor="tenmh">Tên môn học<span style={{ color: 'red' }}>(*)</span></label>
                    <input
                        id="tenmh"
                        name="tenmh"
                        type="text"
                        value={form.tenmh}
                        onChange={onInput}
                        required
                    />

                    {/* Số tín chỉ */}
                    <label htmlFor="sotinchi">Số tín chỉ<span style={{ color: 'red' }}>(*)</span></label>
                    <select
                        id="sotinchi"
                        name="sotinchi"
                        value={form.sotinchi}
                        onChange={onInput}
                        required
                    >
                        <option value="">Chọn số tín chỉ</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>

                    {/* Khoa */}
                    <label htmlFor="khoa">Khoa<span style={{ color: 'red' }}>(*)</span></label>
                    <select
                        id="khoa"
                        name="khoa"
                        value={form.khoa}
                        onChange={onInput}
                        required
                    >
                        <option value="">Chọn khoa</option>
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Cơ điện">Cơ điện</option>
                        <option value="Dầu khí">Dầu khí</option>
                        <option value="Khoa học và Kỹ thuật Địa chất">Khoa học và Kỹ thuật Địa chất</option>
                        <option value="Kinh tế & QTKD">Kinh tế & QTKD</option>
                        <option value="Mỏ">Mỏ</option>
                        <option value="Môi trường">Môi trường</option>
                        <option value="Trắc địa - Bản đồ và Quản lý đất đai">Trắc địa - Bản đồ và Quản lý đất đai</option>
                        <option value="Xây dựng">Xây dựng</option>
                        <option value="Lý luận Chính trị">Lý luận Chính trị</option>
                        <option value="Khoa học cơ bản">Khoa học cơ bản</option>
                    </select>

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
