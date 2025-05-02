// src/pages/admin/schedule/EditSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { getSchedule, updateSchedule } from '../../../api/scheduleApi';
import { getGroups } from '../../../api/groupApi';
import { getAllCourses, getAllTeachers } from '../../../api/utilsApi';
import '../style.css';

export default function EditSchedule() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { schedules, setSchedules } = useOutletContext();

    const [form, setForm] = useState(null);
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);

    function fmtDate(d) {
        return d?.split('T')[0] ?? '';
    }

    useEffect(() => {
        // load the schedule to edit
        (async () => {
            const res = await getSchedule(id);
            setForm({
                ...res.data,
                ngaybd: fmtDate(res.data.ngaybd),
                ngaykt: fmtDate(res.data.ngaykt),
            });
        })();
        // load select-options
        (async () => {
            try {
                const [gRes, cRes, tRes] = await Promise.all([
                    getGroups(),
                    getAllCourses(),
                    getAllTeachers(),
                ]);
                const courses = Object.fromEntries(cRes.data.map(c => [c.mamh, c]));
                const teachers = Object.fromEntries(tRes.data.map(t => [t.mgv, t]));
                setOptions(
                    gRes.data.map(g => ({
                        value: g.manhom,
                        label: `Mã nhóm: ${g.manhom} – ${g.tennhom} – ${courses[g.mamh]?.tenmh} – ${teachers[g.mgv]?.ten}`,
                    }))
                );
            } finally {
                setLoadingOpts(false);
            }
        })();
    }, [id]);

    if (!form) return <div>Loading…</div>;

    const onChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        const res = await updateSchedule(id, form);
        setSchedules(schedules.map(s => (s.id === res.data.id ? res.data : s)));
        navigate('/admin/lichhoc');
    };

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <Select
                    isLoading={loadingOpts}
                    options={options}
                    defaultValue={options.find(o => o.value === form.manhom)}
                    onChange={opt => setForm(f => ({ ...f, manhom: opt.value }))}
                    isClearable
                    styles={{
                        control: base => ({ ...base, backgroundColor: 'black', borderColor: '#555' }),
                        singleValue: base => ({ ...base, color: 'white' }),
                        menu: base => ({ ...base, backgroundColor: 'black' }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#333' : 'black',
                            color: 'white',
                        }),
                        placeholder: base => ({ ...base, color: '#ccc' }),
                        input: base => ({ ...base, color: 'white' }),
                    }}
                />

                <label>Thứ*</label>
                <select name="thu" value={form.thu} onChange={onChange}>
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                    ))}
                </select>

                <label>Tiết bắt đầu*</label>
                <input name="tietbd" type="number" min="1" value={form.tietbd} onChange={onChange} required />

                <label>Tiết kết thúc*</label>
                <input name="tietkt" type="number" min={form.tietbd + 1} value={form.tietkt} onChange={onChange} required />

                <label>Ngày bắt đầu*</label>
                <input name="ngaybd" type="date" value={form.ngaybd} onChange={onChange} required />

                <label>Ngày kết thúc*</label>
                <input name="ngaykt" type="date" min={form.ngaybd} value={form.ngaykt} onChange={onChange} required />

                <div className="form-actions">
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
