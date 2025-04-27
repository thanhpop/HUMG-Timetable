// src/pages/admin/room/AddRoom.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createRoom } from '../../../api/roomApi';
import '../style.css';

export default function AddRoom() {
    const navigate = useNavigate();
    const { rooms, setRooms } = useOutletContext();
    const [form, setForm] = useState({ tenphong: '', khu: '', soluong: 0 });

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'soluong' ? Number(value) : value }));

    };

    const onSubmit = async e => {
        e.preventDefault();
        const res = await createRoom(form);
        setRooms([res.data, ...rooms]);
        navigate('/admin/rooms');
    };

    return (
        <div className="form-card">
            <h2>Thêm Phòng học</h2>
            <form onSubmit={onSubmit} className="two-column-form">

                <label>Tên phòng*</label>
                <input name="tenphong" value={form.tenphong} onChange={onInput} required />
                <label>Khu*</label>
                <input name="khu" value={form.khu} onChange={onInput} required />
                <label>Số lượng*</label>
                <input name="soluong" type="number" min="0" value={form.soluong} onChange={onInput} required />
                <div className="form-actions">
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
