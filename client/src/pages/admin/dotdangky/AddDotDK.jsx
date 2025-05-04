// src/pages/admin/dotdangky/AddDotDK.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { createDotDK } from '../../../api/dotdangkyApi';
import { getAllSemesters } from '../../../api/utilsApi';  // assumes you export this

export default function AddDotDK() {
    const navigate = useNavigate();
    const { dotdk, setDotDK } = useOutletContext();
    const [form, setForm] = useState({
        mahk: '',
        ngaybd_dk: '',
        ngaykt_dk: ''
    });
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [err, setErr] = useState('');

    // load semester list for dropdown
    useEffect(() => {
        (async () => {
            try {
                const res = await getAllSemesters();
                setOptions(
                    res.data.map(s => ({
                        value: s.mahk,
                        label: `Mã học kỳ: ${s.mahk} – ${s.tenhk} – ${s.namhoc}`
                    }))
                );
            } catch (e) {
                console.error('Cannot load semesters', e);
            } finally {
                setLoadingOpts(false);
            }
        })();
    }, []);

    const onSubmit = async e => {
        e.preventDefault();
        if (!form.mahk) {
            setErr('Vui lòng chọn học kỳ');
            return;
        }
        if (new Date(form.ngaykt_dk) <= new Date(form.ngaybd_dk)) {
            setErr('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }
        const res = await createDotDK(form);
        setDotDK([res.data, ...dotdk]);
        navigate('/admin/dotdangky');
    };

    return (
        <div className="form-wrapper">
            <div className="form-card">
                <h2>Thêm Đợt đăng ký</h2>
                <form onSubmit={onSubmit} className="two-column-form">
                    <label>Mã học kỳ*</label>
                    <Select
                        isLoading={loadingOpts}
                        options={options}
                        value={options.find(o => o.value === form.mahk)}
                        onChange={opt => {
                            setForm(f => ({ ...f, mahk: opt.value }));
                            setErr('');
                        }}
                        placeholder="Chọn học kỳ..."
                        styles={{
                            control: base => ({ ...base, backgroundColor: '#000', borderColor: '#444' }),
                            menu: base => ({ ...base, backgroundColor: '#000' }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? '#333' : '#000',
                                color: '#fff'
                            }),
                            singleValue: base => ({ ...base, color: '#fff' }),
                            placeholder: base => ({ ...base, color: '#aaa' })
                        }}
                    />
                    {err && <div className="error-message">{err}</div>}

                    <label>Ngày bắt đầu đăng ký*</label>
                    <input
                        name="ngaybd_dk"
                        type="date"
                        value={form.ngaybd_dk}
                        onChange={e => setForm(f => ({ ...f, ngaybd_dk: e.target.value }))}
                        required
                    />

                    <label>Ngày kết thúc đăng ký*</label>
                    <input
                        name="ngaykt_dk"
                        type="date"
                        min={form.ngaybd_dk}
                        value={form.ngaykt_dk}
                        onChange={e => setForm(f => ({ ...f, ngaykt_dk: e.target.value }))}
                        required
                    />

                    <div className="form-actions">
                        <button type="submit">Thêm</button>
                        <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
