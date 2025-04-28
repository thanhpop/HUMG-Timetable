import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createGroup } from '../../../api/groupApi';
import '../style.css';

export default function AddGroup() {
    const nav = useNavigate();
    const { groups, setGroups } = useOutletContext();
    const [form, setForm] = useState({
        manhom: '', tennhom: '', mamh: '', mgv: '', maphong: '', soluongsv: 0
    });
    const [error, setError] = useState('');

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'soluongsv' ? +value : value }));
        if (name === 'manhom') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (groups.some(g => g.manhom === form.manhom)) {
            setError('Mã nhóm đã tồn tại'); return;
        }
        const res = await createGroup(form);
        setGroups([res.data, ...groups]);
        nav('/admin/groups');
    };

    return (
        <div className="form-card">
            <h2>Thêm Nhóm môn học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <input name="manhom" value={form.manhom} onChange={onInput} required />
                {error && <div className="error-message">{error}</div>}

                <label>Tên nhóm*</label>
                <input name="tennhom" value={form.tennhom} onChange={onInput} required />

                <label>Mã MH*</label>
                <input name="mamh" value={form.mamh} onChange={onInput} required />

                <label>Mã GV*</label>
                <input name="mgv" value={form.mgv} onChange={onInput} required />

                <label>Phòng*</label>
                <input name="maphong" value={form.maphong} onChange={onInput} required />

                <label>Số SV</label>
                <input name="soluongsv" type="number" min="0"
                    value={form.soluongsv} onChange={onInput}
                />

                <div className="form-actions">
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
