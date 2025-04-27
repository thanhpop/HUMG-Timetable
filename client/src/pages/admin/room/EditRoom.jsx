// src/pages/admin/room/EditRoom.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getRoom, updateRoom } from '../../../api/roomApi';
import '../style.css';

export default function EditRoom() {
    const navigate = useNavigate();
    const { maphong } = useParams();
    const { rooms, setRooms } = useOutletContext();
    const [form, setForm] = useState(null);


    useEffect(() => {
        (async () => {
            const res = await getRoom(maphong);
            setForm(res.data);
        })();
    }, [maphong]);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'soluong' ? Number(value) : value }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        const res = await updateRoom(maphong, form);
        setRooms(rooms.map(r => r.maphong === res.data.maphong ? res.data : r));
        navigate('/admin/rooms');
    };

    if (!form) return <div>Loading…</div>;

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Phòng học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Tên phòng*</label>
                <input name="tenphong" value={form.tenphong} onChange={onInput} required />
                <label>Khu*</label>
                <input name="khu" value={form.khu} onChange={onInput} required />
                <label>Số lượng*</label>
                <input name="soluong" type="number" min="0" value={form.soluong} onChange={onInput} required />
                <div className="form-actions">
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
