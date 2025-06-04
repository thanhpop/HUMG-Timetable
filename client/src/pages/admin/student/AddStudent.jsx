// src/pages/admin/student/AddStudent.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createStudent } from '../../../api/studentApi';
import '../style.css';

export default function AddStudent() {
    const navigate = useNavigate();
    const { students, setStudents } = useOutletContext();

    const [form, setForm] = useState({
        msv: '',
        ten: '',
        khoa: '',
        lop: '',
        khoaHoc: '',
        gioitinh: '',
        ngaysinh: '',
        sdt: '',
        email: '',
        cccd: '',
        diachi: '',
    });
    const [error, setError] = useState('');

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'msv') setError('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (students.some(s => s.msv === form.msv)) {
            setError(`Mã sinh viên "${form.msv}" đã tồn tại!`);
            return;
        }

        // nếu không trùng, gọi API thêm
        try {
            const res = await createStudent(form);
            setStudents([res.data, ...students]);
            navigate('/admin/students');
        } catch (err) {
            console.error(err);
            setError('Có lỗi khi thêm sinh viên. Vui lòng thử lại.');
        }
    };




    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2>Thêm sinh viên</h2>
                <form onSubmit={handleSubmit} className="two-column-form"
                >

                    <label htmlFor="msv">Mã sinh viên<span style={{ color: 'red' }}>(*)</span></label>
                    <input id="msv" name="msv" type="number" pattern="\d*" value={form.msv} onChange={handleInput} required />
                    {error && <div className="error-message">{error}</div>}


                    <label htmlFor="ten">Họ và tên<span style={{ color: 'red' }}>(*)</span></label>
                    <input id="ten" name="ten" value={form.ten} onChange={handleInput} required />

                    <label htmlFor="khoa">Khoa<span style={{ color: 'red' }}>(*)</span></label>
                    <select
                        id="khoa"
                        name="khoa"
                        value={form.khoa}
                        onChange={handleInput}
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
                    </select>

                    <label htmlFor="lop">Lớp<span style={{ color: 'red' }}>(*)</span></label>
                    <input id="lop" name="lop" value={form.lop} onChange={handleInput} required />
                    <label htmlFor="khoaHoc">Khóa học<span style={{ color: 'red' }}>(*)</span></label>
                    <input
                        id="khoaHoc"
                        name="khoaHoc"
                        type="text"

                        value={form.khoaHoc}
                        onChange={handleInput}
                        required
                    />
                    <label htmlFor="gioitinh">Giới tính<span style={{ color: 'red' }}>(*)</span></label>
                    <select id="gioitinh" name="gioitinh" value={form.gioitinh} onChange={handleInput} required>
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>

                    <label htmlFor="ngaysinh">Ngày sinh<span style={{ color: 'red' }}>(*)</span></label>
                    <input id="ngaysinh" type="date" name="ngaysinh" value={form.ngaysinh} onChange={handleInput} required />

                    <label htmlFor="sdt">Số điện thoại</label>
                    <input id="sdt" name="sdt" type="tel" inputMode="numeric" pattern="\d*" value={form.sdt} onChange={handleInput} />

                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleInput} />

                    <label htmlFor="cccd">CCCD</label>
                    <input id="cccd" name="cccd" type="number" pattern="\d*" value={form.cccd} onChange={handleInput} />

                    <label htmlFor="diachi">Địa chỉ</label>
                    <input id="diachi" name="diachi" type="text" value={form.diachi} onChange={handleInput} />

                    <div className="form-actions">
                        <button type="submit">Thêm</button>
                        <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div >
        </div>
    );
} 