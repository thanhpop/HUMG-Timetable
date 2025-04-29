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
    const [errorMahk, setErrorMahk] = useState('');
    const [errorNgay, setErrorNgay] = useState('');

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'mahk') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();

        // validate năm học: YYYY-YYYY and difference = 1
        const pattern = /^\d{4}-\d{4}$/;
        if (!pattern.test(form.namhoc)) {
            setErrorNamhoc('Năm học phải đúng định dạng YYYY-YYYY');
            return;
        }
        const [startYear, endYear] = form.namhoc.split('-').map(Number);
        if (endYear !== startYear + 1) {
            setErrorNamhoc('Năm kết thúc phải lớn hơn năm bắt đầu 1 năm');
            return;
        }

        if (form.ngaykt <= form.ngaybd) {
            setErrorNgay('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }
        // kiểm tra duplicate mã HK
        if (semesters.some(s => s.mahk === form.mahk)) {
            setErrorMahk('Mã học kỳ đã tồn tại');
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
                {errorMahk && <div className="error-message">{errorMahk}</div>}



                <label htmlFor="tenhk">Tên HK*</label>
                <select
                    id="tenhk"
                    name="tenhk"
                    value={form.tenhk}
                    onChange={onInput}
                    required
                >
                    <option value="">-- Chọn học kỳ --</option>
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Học kỳ 3">Học kỳ 3</option>
                </select>



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
                    min={form.ngaybd}
                />
                {errorNgay && <div className="error-message">{errorNgay}</div>}

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
