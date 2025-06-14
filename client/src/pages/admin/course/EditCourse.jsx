// src/pages/admin/course/EditCourse.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getCourse, updateCourse } from '../../../api/courseApi';
import '../style.css';

export default function EditCourse() {
    const navigate = useNavigate();
    const { mamh } = useParams();
    const { courses, setCourses } = useOutletContext();

    const [form, setForm] = useState({
        mamh: '',
        tenmh: '',
        sotinchi: '',
        khoa: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const res = await getCourse(mamh);
            const c = res.data;
            setForm({
                mamh: c.mamh,
                tenmh: c.tenmh,
                sotinchi: c.sotinchi,
                khoa: c.khoa
            });
        })();
    }, [mamh]);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'mamh') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        // kiểm tra trùng mã môn học (trừ chính môn học này)
        const dup = courses.some(
            c => c.mamh === form.mamh && c.mamh.toString() !== mamh
        );
        if (dup) {
            setError(`Mã môn học "${form.mamh}" đã tồn tại!`);
            return;
        }

        const res = await updateCourse(mamh, form);
        setCourses(courses.map(c => (c.mamh === res.data.mh ? res.data : c)));
        navigate('/admin/courses');
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2 className="form-title">Chỉnh sửa Môn học</h2>
                <form onSubmit={onSubmit} className="two-column-form">
                    <label htmlFor="mamh">Mã môn học <span style={{ color: 'red' }}>(*)</span></label>
                    <input
                        id="mamh" name="mamh" type="text"
                        value={form.mamh} disabled
                    />
                    {error && <div className="error-message">{error}</div>}

                    <label htmlFor="tenmh">Tên môn học <span style={{ color: 'red' }}>(*)</span></label>
                    <input
                        id="tenmh" name="tenmh" type="text"
                        value={form.tenmh} onChange={onInput} required
                    />

                    <label htmlFor="sotinchi">Số tín chỉ <span style={{ color: 'red' }}>(*)</span></label>
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

                    <label htmlFor="khoa">Khoa <span style={{ color: 'red' }}>(*)</span></label>
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
                        <button type="submit" className="btn btn-primary">Lưu</button>
                        <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
