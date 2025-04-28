import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getGroup, updateGroup } from '../../../api/groupApi';
import '../style.css';

export default function EditGroup() {
    const nav = useNavigate();
    const { manhom } = useParams();
    const { groups, setGroups } = useOutletContext();
    const [form, setForm] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const res = await getGroup(manhom);
            setForm(res.data);
        })();
    }, [manhom]);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'soluongsv' ? +value : value }));
        if (name === 'manhom') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (groups.some(g => g.manhom === form.manhom && g.manhom !== manhom)) {
            setError('Mã nhóm trùng'); return;
        }
        const res = await updateGroup(manhom, form);
        setGroups(groups.map(g => g.manhom === res.data.manhom ? res.data : g));
        nav('/admin/groups');
    };

    if (!form) return <div>Loading…</div>;

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Nhóm</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <input name="manhom" value={form.manhom} disabled />
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
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
