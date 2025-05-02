import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createDotDK } from '../../../api/dotdangkyApi';

export default function AddDotDK() {
    const navigate = useNavigate();
    const { dotdk, setDotDK } = useOutletContext();
    const [form, setForm] = useState({ mahk: '', ngaybd_dk: '', ngaykt_dk: '' });
    const [err, setErr] = useState('');

    const onInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async e => {
        e.preventDefault();
        if (new Date(form.ngaykt_dk) <= new Date(form.ngaybd_dk)) {
            setErr('Ngày kết thúc phải sau ngày bắt đầu'); return;
        }
        const res = await createDotDK(form);
        setDotDK([res.data, ...dotdk]);
        navigate('/admin/dotdangky');
    };

    return (
        <div className="form-wrapper">
            <div className="form-card">
                <h2>Thêm Đợt đăng ký</h2>
                <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
                    <label>Mã HK*</label>
                    <input name="mahk" value={form.mahk} onChange={onInput} required />
                    <label>Ngày bắt đầu đăng ký*</label>
                    <input name="ngaybd_dk" type="datetime-local" value={form.ngaybd_dk} onChange={onInput} required />
                    <label>Ngày kết thúc đăng ký*</label>
                    <input name="ngaykt_dk" type="datetime-local" min={form.ngaybd_dk} value={form.ngaykt_dk} onChange={onInput} required />
                    {err && <div style={{ color: 'red' }}>{err}</div>}
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </form>
            </div>
        </div>
    );
}
