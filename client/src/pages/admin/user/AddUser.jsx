// src/pages/admin/user/AddUser.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createUser, getUsers } from '../../../api/userApi';

export default function AddUser() {
    const nav = useNavigate();
    const { users, setUsers } = useOutletContext();    // đổi accounts → users

    const [form, setForm] = useState({
        username: '',
        password: '',
        vaitro: 'sv'
    });
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();

        // kiểm tra trùng username trên mảng users
        if (users.some(u => u.username === form.username)) {
            setError('Username đã tồn tại');
            return;
        }

        // gọi API tạo user
        await createUser(form);

        // load lại danh sách và cập nhật context
        const res = await getUsers();
        setUsers(res.data);

        // chuyển về trang list users
        nav('/admin/users');
    };

    return (
        <div className="form-card">
            <h2 className="form-title">Thêm user</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Username<span style={{ color: 'red' }}>(*)</span></label>
                <input
                    name="username"
                    required
                    value={form.username}
                    onChange={e => {
                        setForm(f => ({ ...f, username: e.target.value }));
                        setError('');
                    }}
                />
                {error && <div className="error-message">{error}</div>}

                <label>Password<span style={{ color: 'red' }}>(*)</span></label>
                <input
                    name="password"

                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />

                <label>Vai trò<span style={{ color: 'red' }}>(*)</span></label>
                <select
                    name="vaitro"
                    value={form.vaitro}
                    onChange={e => setForm(f => ({ ...f, vaitro: e.target.value }))}
                >
                    <option value="gv">Giáo viên</option>
                    <option value="sv">Sinh viên</option>
                </select>

                <div className="form-actions">
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
