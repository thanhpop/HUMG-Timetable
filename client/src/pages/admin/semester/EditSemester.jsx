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
                />


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
