// src/pages/admin/teacher/EditTeacher.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getTeacher, updateTeacher } from '../../../api/teacherApi';
import '../style.css';

export default function EditTeacher() {
    const navigate = useNavigate();
    const { mgv } = useParams();              // ← dùng mgv
    const { teachers, setTeachers } = useOutletContext();

    const [form, setForm] = useState({
        mgv: '',
        ten: '',
        khoa: '',
        gioitinh: '',
        email: '',
        sdt: ''
    });

    // load dữ liệu lên form
    useEffect(() => {
        (async () => {
            const res = await getTeacher(mgv);    // ← lấy theo mgv
            const t = res.data;
            setForm({
                mgv: t.mgv,
                ten: t.ten,
                khoa: t.khoa,
                gioitinh: t.gioitinh || '',
                email: t.email || '',
                sdt: t.sdt || ''
            });
        })();
    }, [mgv]);

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await updateTeacher(mgv, form);   // ← cập nhật theo mgv
        setTeachers(teachers.map(t => (t.mgv === res.data.mgv ? res.data : t)));  // ← so sánh mgv
        navigate('/admin/teachers');
    };

    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2 className="form-title">Chỉnh sửa Giáo viên</h2>
                <form onSubmit={handleSubmit} className="two-column-form">
                    <label htmlFor="mgv">Mã giảng viên*</label>
                    <input
                        id="mgv" name="mgv" type="text"
                        value={form.mgv} onChange={handleInput}
                        required
                        disabled
                    />

                    <label htmlFor="ten">Họ và tên*</label>
                    <input
                        id="ten" name="ten" type="text"
                        value={form.ten} onChange={handleInput}
                        required
                    />

                    <label htmlFor="gioitinh">Giới tính*</label>
                    <select
                        id="gioitinh" name="gioitinh"
                        value={form.gioitinh} onChange={handleInput}
                        required
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>

                    <label htmlFor="khoa">Khoa*</label>
                    <input
                        id="khoa" name="khoa" type="text"
                        value={form.khoa} onChange={handleInput}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email" name="email" type="email"
                        value={form.email} onChange={handleInput}
                    />

                    <label htmlFor="sdt">Số ĐT</label>
                    <input
                        id="sdt" name="sdt" type="tel"
                        value={form.sdt} onChange={handleInput}
                    />

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Lưu</button>
                        <button type="button" onClick={() => navigate(-1)}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
