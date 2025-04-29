// src/pages/admin/semester/EditSemester.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getSemester, updateSemester } from '../../../api/semesterApi';
import '../style.css';

export default function EditSemester() {
    const nav = useNavigate();
    const { mahk } = useParams();                  // id ở đây chính là mahk
    const { semesters, setSemesters } = useOutletContext();

    const [form, setForm] = useState({
        mahk: '',
        tenhk: '',
        namhoc: '',
        ngaybd: '',
        ngaykt: ''
    });
    const [error, setError] = useState('');

    // load lên form
    useEffect(() => {
        (async () => {
            const res = await getSemester(mahk);
            // định dạng date string yyyy-MM-dd cho input[type=date]
            const toInputDate = iso => {
                const d = new Date(iso);
                const off = d.getTimezoneOffset();
                return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
            };
            setForm({
                mahk: res.data.mahk,
                tenhk: res.data.tenhk,
                namhoc: res.data.namhoc,
                ngaybd: res.data.ngaybd ? toInputDate(res.data.ngaybd) : '',
                ngaykt: res.data.ngaykt ? toInputDate(res.data.ngaykt) : ''
            });
        })();
    }, [mahk]);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));

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
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }
        const res = await updateSemester(mahk, form);
        setSemesters(semesters.map(s => s.mahk === mahk ? res.data : s));
        nav('/admin/semesters');
    };

    return (
        <div className="form-card">
            <h2 className="form-title">Chỉnh sửa Học kỳ</h2>
            <form onSubmit={onSubmit} className="two-column-form">

                <label htmlFor="mahk">Mã HK*</label>
                <input
                    id="mahk"
                    name="mahk"
                    value={form.mahk}
                    onChange={onInput}
                    required
                    disabled
                />



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
                    value={form.namhoc}
                    onChange={onInput}
                    required
                    placeholder="YYYY-YYYY"
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
                {error && <div className="error-message">{error}</div>}


                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Lưu</button>
                    <button type="button" onClick={() => nav(-1)}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
