import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createStudent } from '../../../api/studentApi';

export default function AddStudent() {
    const navigate = useNavigate();
    const { students, setStudents } = useOutletContext();
    const [form, setForm] = useState({ msv: '', name: '', khoa: '', lop: '', gender: '', dob: '' });

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await createStudent(form);
        setStudents([res.data, ...students]);
        navigate('/admin/students');
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Thêm sinh viên</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
                <label htmlFor="msv">Mã sinh viên</label>
                <input id="msv" name="msv" placeholder="Mã sinh viên" value={form.msv} onChange={handleInput} />

                <label htmlFor="name">Họ và tên</label>
                <input id="name" name="name" placeholder="Tên" value={form.name} onChange={handleInput} />

                <label htmlFor="khoa">Khoa</label>
                <input id="khoa" name="khoa" placeholder="Khoa" value={form.khoa} onChange={handleInput} />

                <label htmlFor="lop">Lớp</label>
                <input id="lop" name="lop" placeholder="Lớp" value={form.lop} onChange={handleInput} />

                <label htmlFor="gender">Giới tính</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleInput}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>

                <label htmlFor="dob">Ngày sinh</label>
                <input id="dob" type="date" name="dob" value={form.dob} onChange={handleInput} />

                <div>
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
