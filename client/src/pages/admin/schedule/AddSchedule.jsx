import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { createSchedule } from '../../../api/scheduleApi';
import '../style.css';

export default function AddSchedule() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();
    const [form, setForm] = useState({
        manhom: '', thu: 2, tietbd: 1, tietkt: 2, ngaybd: '', ngaykt: ''
    });
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        (async () => {
            try {
                // fetch groups, courses, teachers
                const [gRes, cRes, tRes] = await Promise.all([
                    getAllGroups(),       // should return [{ manhom, tennhom, mamh, mgv, … }, …]
                    getAllCourses(),      // [{ mamh, tenmh, … }, …]
                    getAllTeachers()      // [{ mgv, ten, … }, …]
                ]);

                const groups = gRes.data;
                const courses = cRes.data.reduce((m, c) => { m[c.mamh] = c; return m; }, {});
                const teachers = tRes.data.reduce((m, t) => { m[t.mgv] = t; return m; }, {});

                // build react-select options
                const opts = groups.map(g => ({
                    value: g.manhom,
                    label: `${g.manhom} – ${g.tennhom} – ${courses[g.mamh]?.tenmh || g.mamh} – ${teachers[g.mgv]?.ten || g.mgv}`
                }));

                setOptions(opts);
            } catch (e) {
                console.error('Cannot load group options', e);
            } finally {
                setLoadingOpts(false);
            }
        })();
    }, []);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!form.manhom) {
            setError('Vui lòng chọn nhóm');
            return;
        }
        const res = await createSchedule(form);
        setSchedules([res.data, ...schedules]);
        navigate('/admin/lichhoc');
    };

    return (
        <div className="form-card">
            <h2>Thêm Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <Select
                    isLoading={loadingOpts}
                    options={options}
                    onChange={opt => setForm(f => ({ ...f, manhom: opt.value }))}
                    placeholder="Chọn nhóm..."
                />
                {error && <div className="error-message">{error}</div>}
                <label>Thứ*</label>
                <select name="thu" value={form.thu} onChange={onInput}>
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                    ))}
                </select>

                <label>Tiết bắt đầu*</label>
                <input name="tietbd" type="number" min="1" value={form.tietbd} onChange={onInput} required />
                <label>Tiết kết thúc*</label>
                <input name="tietkt" type="number" min={form.tietbd} value={form.tietkt} onChange={onInput} required />

                <label>Ngày bắt đầu*</label>
                <input name="ngaybd" type="date" value={form.ngaybd} onChange={onInput} required />
                <label>Ngày kết thúc*</label>
                <input name="ngaykt" type="date" min={form.ngaybd} value={form.ngaykt} onChange={onInput} required />

                <div className="form-actions">
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
