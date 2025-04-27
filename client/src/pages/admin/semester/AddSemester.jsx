// src/pages/admin/semester/AddSemester.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createSemester } from '../../../api/semesterApi';
import '../style.css';

export default function AddSemester() {
    const nav = useNavigate();
    const { semesters, setSemesters } = useOutletContext();

    const [form, setForm] = useState({
        mahk: '',
        tenhk: '',
        namhoc: '',
        ngaybd: '',
        ngaykt: ''
    });
    const [error, setError] = useState('');

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'mahk') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        // kiểm tra duplicate mã HK
        if (semesters.some(s => s.mahk === form.mahk)) {
            setError('Mã học kỳ đã tồn tại');
            return;
        }
        // gọi API tạo mới
        const res = await createSemester(form);
        setSemesters([res.data, ...semesters]);
        nav('/admin/semesters');
    };

    return (
        <div className="form-card">
            <h2 className="form-title">Thêm Học kỳ</h2>
            <form onSubmit={onSubmit} className="two-column-form">

                <label htmlFor="mahk">Mã HK*</label>
                <input
                    id="mahk"
                    name="mahk"
                    value={form.mahk}
                    onChange={onInput}
                    required
                />
                {error && <div className="error-message">{error}</div>}



                <label htmlFor="tenhk">Tên HK*</label>
                <input
                    id="tenhk"
                    name="tenhk"
                    value={form.tenhk}
                    onChange={onInput}
                    required
                />



                <label htmlFor="namhoc">Năm học*</label>
                <input
                    id="namhoc"
                    name="namhoc"
                    placeholder="YYYY-YYYY"
                    value={form.namhoc}
                    onChange={onInput}
                    required
                />



                <label htmlFor="ngaybd">Ngày bắt đầu*</label>
                <input
                    id="ngaybd"
                    name="ngaybd"
                    type="date"
                    value={form.ngaybd}
                    onChange={onInput}
                    required
                />



                <label htmlFor="ngaykt">Ngày kết thúc*</label>
                <input
                    id="ngaykt"
                    name="ngaykt"
                    type="date"
                    value={form.ngaykt}
                    onChange={onInput}
                    required
                />

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Thêm</button>
                    <button
                        type="button"

                        onClick={() => nav(-1)}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
