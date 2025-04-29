// src/pages/admin/teacher/AddTeacher.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createTeacher } from '../../../api/teacherApi';
import '../style.css';

export default function AddTeacher() {
    const navigate = useNavigate();
    const { teachers, setTeachers } = useOutletContext();

    const [form, setForm] = useState({
        mgv: '',
        ten: '',
        khoa: '',
        gioitinh: '',
        email: '',
        sdt: ''
    });
    const [error, setError] = useState('');

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'mgv') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        // kiểm tra trùng MGV
        if (teachers.some(t => t.mgv === form.mgv)) {
            setError(`Mã giảng viên "${form.mgv}" đã tồn tại!`);
            return;
        }
        // gọi API tạo mới
        const res = await createTeacher(form);
        setTeachers([res.data, ...teachers]);
        navigate('/admin/teachers');
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2 className="form-title">Thêm Giáo viên</h2>
                <form onSubmit={onSubmit} className="two-column-form">
                    <label htmlFor="mgv">Mã giảng viên*</label>
                    <input
                        id="mgv"
                        name="mgv"
                        type="text"
                        value={form.mgv}
                        onChange={onInput}
                        required
                    />
                    {error && <div className="error-message">{error}</div>}

                    <label htmlFor="ten">Họ và tên*</label>
                    <input
                        id="ten"
                        name="ten"
                        type="text"
                        value={form.ten}
                        onChange={onInput}
                        required
                    />

                    <label htmlFor="gioitinh">Giới tính</label>
                    <select
                        id="gioitinh"
                        name="gioitinh"
                        value={form.gioitinh}
                        onChange={onInput}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>

                    <label htmlFor="khoa">Khoa*</label>
                    <select
                        id="khoa"
                        name="khoa"
                        value={form.khoa}
                        onChange={onInput}
                        required
                    >
                        <option value="">Chọn khoa</option>
                        <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
                        <option value="Cơ - Điện">Cơ - Điện</option>
                        <option value="Dầu khí và Năng lượng">Dầu khí và Năng lượng</option>
                        <option value="Khoa học và Kỹ thuật Địa chất">Khoa học và Kỹ thuật Địa chất</option>
                        <option value="Kinh tế - Quản trị kinh doanh">Kinh tế - Quản trị kinh doanh</option>
                        <option value="Mỏ">Mỏ</option>
                        <option value="Môi trường">Môi trường</option>
                        <option value="Trắc địa - Bản đồ và Quản lý đất đai">Trắc địa - Bản đồ và Quản lý đất đai</option>
                        <option value="Xây dựng">Xây dựng</option>
                        <option value="Lý luận Chính trị">Lý luận Chính trị</option>
                        <option value="Khoa học cơ bản">Khoa học cơ bản</option>
                        <option value="Giáo dục Quốc phòng">Giáo dục Quốc phòng</option>
                    </select>

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onInput}
                    />

                    <label htmlFor="sdt">Số ĐT</label>
                    <input
                        id="sdt"
                        name="sdt"
                        type="tel"
                        value={form.sdt}
                        onChange={onInput}
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
