import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getDotDKById, updateDotDK } from '../../../api/dotdangkyApi';

export default function EditDotDK() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dotdk, setDotDK } = useOutletContext();
    const [form, setForm] = useState(null);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            const res = await getDotDKById(id);
            // convert to input‑friendly
            const d = res.data;
            setForm({
                ...d,
                ngaybd_dk: d.ngaybd_dk.split('.000Z')[0],
                ngaykt_dk: d.ngaykt_dk.split('.000Z')[0]
            });
        })();
    }, [id]);

    if (!form) return <div>Loading…</div>;

    const onInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async e => {
        e.preventDefault();
        if (new Date(form.ngaykt_dk) <= new Date(form.ngaybd_dk)) {
            setErr('Ngày kết thúc phải sau ngày bắt đầu'); return;
        }
        const res = await updateDotDK(id, form);
        setDotDK(dotdk.map(d => d.id === res.data.id ? res.data : d));
        navigate('/admin/dotdangky');
    };

    return (
        <div className="form-wrapper">
            <div className="form-card">
                <h2>Chỉnh sửa Đợt đăng ký</h2>
                <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
                    <label>Mã HK*</label>
                    <input name="mahk" value={form.mahk} onChange={onInput} required disabled />
                    <label>Ngày bắt đầu đăng ký*</label>
                    <input name="ngaybd_dk" type="datetime-local" value={form.ngaybd_dk} onChange={onInput} required />
                    <label>Ngày kết thúc đăng ký*</label>
                    <input name="ngaykt_dk" type="datetime-local" min={form.ngaybd_dk} value={form.ngaykt_dk} onChange={onInput} required />
                    {err && <div style={{ color: 'red' }}>{err}</div>}
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </form>
            </div>
        </div>
    );
}
