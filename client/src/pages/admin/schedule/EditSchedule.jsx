import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getSchedule, updateSchedule } from '../../../api/scheduleApi';
import '../style.css';

export default function EditSchedule() {
    const nav = useNavigate();
    const { id } = useParams();
    const { schedules, setSchedules } = useOutletContext();
    const [form, setForm] = useState(null);
    function formatDateForInput(isoString) {
        return isoString?.split('T')[0] ?? '';
    }
    useEffect(() => {
        (async () => {
            const res = await getSchedule(id);
            setForm({
                ...res.data,
                ngaybd: formatDateForInput(res.data.ngaybd),
                ngaykt: formatDateForInput(res.data.ngaykt),
            });
        })();
    }, [id]);

    if (!form) return <div>Loading…</div>;

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        const res = await updateSchedule(id, form);
        setSchedules(schedules.map(s => s.id === res.data.id ? res.data : s));
        nav('/admin/lichhoc');
    };

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <input name="manhom" value={form.manhom} onChange={onInput} required />

                <label>Thứ*</label>
                <select name="thu" value={form.thu} onChange={onInput}>
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                    ))}
                </select>

                <label>Tiết bắt đầu*</label>
                <input name="tietbd" type="number" value={form.tietbd} onChange={onInput} required />
                <label>Tiết kết thúc*</label>
                <input name="tietkt" type="number" min={form.tietbd} value={form.tietkt} onChange={onInput} required />

                <label>Ngày bắt đầu*</label>
                <input name="ngaybd" type="date" value={form.ngaybd?.split('T')[0]} onChange={onInput} required />
                <label>Ngày kết thúc*</label>
                <input name="ngaykt" type="date" min={form.ngaybd?.split('T')[0]} value={form.ngaykt?.split('T')[0]} onChange={onInput} required />

                <div className="form-actions">
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
