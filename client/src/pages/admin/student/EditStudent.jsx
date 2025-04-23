// src/pages/admin/student/EditStudent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getStudent, updateStudent } from '../../../api/studentApi';

export default function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();               // lấy id từ URL
    const { students, setStudents } = useOutletContext();
    const [form, setForm] = useState(null);   // form khởi tạo sau khi tìm student

    // khi mount, tìm student theo id và set lên form
    useEffect(() => {
        (async () => {
            const res = await getStudent(id);
            setForm(res.data);
        })();
    }, [id]);

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await updateStudent(id, form);
        setStudents(students.map(s => (s.id === res.data.id ? res.data : s)));
        navigate('/admin/students');
    };
    const formatDateForInput = isoString => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().split('T')[0];
    };

    if (!form) return <div>Loading…</div>; // hoặc một loading indicator

    return (
        <div style={{ padding: 20 }}>
            <h2>Chỉnh sửa sinh viên</h2>
            <form onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
                <label htmlFor="msv">Mã sinh viên</label>
                <input id="msv" name="msv" value={form.msv} onChange={handleInput} />

                <label htmlFor="name">Họ và tên</label>
                <input id="name" name="name" value={form.name} onChange={handleInput} />

                <label htmlFor="khoa">Khoa</label>
                <input id="khoa" name="khoa" value={form.khoa} onChange={handleInput} />

                <label htmlFor="lop">Lớp</label>
                <input id="lop" name="lop" value={form.lop} onChange={handleInput} />

                <label htmlFor="gender">Giới tính</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleInput}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>

                <label htmlFor="dob">Ngày sinh</label>
                <input id="dob" type="date" name="dob" value={form.dob ? formatDateForInput(form.dob) : ''} onChange={handleInput} />

                <div>
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
