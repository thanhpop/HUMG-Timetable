import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getUserById, updateUser } from '../../../api/userApi';
import '../style.css';

export default function EditUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { users, setUsers } = useOutletContext();
    const [form, setForm] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getUserById(id);
                setForm(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy user:", err);
            }
        })();
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await updateUser(id, form);
            const res = await getUserById(id);
            setUsers(prev => prev.map(u => u.id === res.data.id ? res.data : u));
            navigate('/admin/users');
        } catch (err) {
            console.error("Lỗi khi cập nhật user:", err);
        }
    };

    if (!form) return <div>Loading…</div>;

    return (

        <div className="form-card">
            <h2 className="form-title">Chỉnh sửa user</h2>
            <form onSubmit={handleSubmit} className="two-column-form">
                <label>Username<span style={{ color: 'red' }}>(*)</span></label>
                <input value={form.username} disabled />

                <label>Password<span style={{ color: 'red' }}>(*)</span></label>
                <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />

                <label>Vai trò<span style={{ color: 'red' }}>(*)</span></label>
                {form.vaitro === 'admin' ? (
                    /* if it's an admin account, just show it as text */
                    <input type="text" value="Admin" disabled className="readonly-input" />
                ) : (
                    /* otherwise allow switching between gv and sv */
                    <select
                        value={form.vaitro}
                        onChange={e => setForm(f => ({ ...f, vaitro: e.target.value }))}
                        required
                    >
                        <option value="gv">Giáo viên</option>
                        <option value="sv">Sinh viên</option>
                    </select>
                )}

                <div className="form-actions">
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
