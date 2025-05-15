// src/pages/admin/student/EditStudent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getStudent, updateStudent } from '../../../api/studentApi';
import '../style.css';
export default function EditStudent() {
    const navigate = useNavigate();
    const { msv } = useParams();
    const { students, setStudents } = useOutletContext();

    const [form, setForm] = useState(null);
    const [error, setError] = useState('');

    const formatDateForInput = isoString => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().split('T')[0];
    };

    // load dữ liệu sinh viên
    useEffect(() => {
        (async () => {
            const res = await getStudent(msv);
            const stu = res.data;
            if (stu.ngaysinh) {
                // chuyển ISO → "YYYY-MM-DD"
                stu.ngaysinh = formatDateForInput(stu.ngaysinh);
            }
            setForm(stu);
        })();
    }, [msv]);

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'msv') setError('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const isDuplicate = students.some(
            s => s.msv === form.msv && s.msv.toString() !== msv
        );

        if (isDuplicate) {
            setError('Mã sinh viên đã tồn tại.');
            return;
        }

        const res = await updateStudent(msv, form);
        setStudents(students.map(s => (s.msv === res.data.msv ? res.data : s)));
        navigate('/admin/students');
    };

    if (!form) return <div>Loading…</div>;

    return (
        <div style={{ padding: 20 }}>
            <div className="form-card">
                <h2>Chỉnh sửa sinh viên</h2>

                <form onSubmit={handleSubmit}
                    className="two-column-form">

                    <label htmlFor="msv">Mã sinh viên</label>
                    <input id="msv" name="msv" type="number" pattern="\d*" value={form.msv} onChange={handleInput} disabled />
                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    <label htmlFor="ten">Họ và tên</label>
                    <input id="ten" name="ten" value={form.ten} onChange={handleInput} />

                    <label htmlFor="khoa">Khoa</label>
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
                        <option value="Kinh tế">Kinh tế</option>
                        <option value="Mỏ">Mỏ</option>
                        <option value="Môi trường">Môi trường</option>
                        <option value="Trắc địa - Bản đồ và Quản lý đất đai">Trắc địa - Bản đồ và Quản lý đất đai</option>
                        <option value="Xây dựng">Xây dựng</option>
                    </select>
                    <label htmlFor="khoaHoc">Khóa học</label>
                    <input
                        id="khoaHoc"
                        name="khoaHoc"
                        type="text"

                        value={form.khoaHoc}
                        onChange={handleInput}
                        required
                    />
                    <label htmlFor="lop">Lớp</label>
                    <input id="lop" name="lop" value={form.lop} onChange={handleInput} />

                    <label htmlFor="gioitinh">Giới tính</label>
                    <select id="gioitinh" name="gioitinh" value={form.gioitinh} onChange={handleInput}>
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>

                    <label htmlFor="ngaysinh">Ngày sinh</label>
                    <input id="ngaysinh" type="date" name="ngaysinh"
                        value={form.ngaysinh} onChange={handleInput} />

                    <label htmlFor="sdt">Số điện thoại</label>
                    <input id="sdt" name="sdt" type="tel" pattern="\d*" inputMode="numeric" value={form.sdt || ''} onChange={handleInput} />

                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={form.email || ''} onChange={handleInput} />

                    <label htmlFor="cccd">CCCD</label>
                    <input id="cccd" name="cccd" type="number" pattern="\d*" value={form.cccd || ''} onChange={handleInput} />

                    <label htmlFor="diachi">Địa chỉ</label>
                    <input id="diachi" name="diachi" value={form.diachi || ''} onChange={handleInput} />

                    <div className="form-actions">
                        <button type="submit">Lưu</button>
                        <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
