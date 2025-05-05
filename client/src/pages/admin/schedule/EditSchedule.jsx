// src/pages/admin/schedule/EditSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { getSchedule, updateSchedule } from '../../../api/scheduleApi';
import { getGroups } from '../../../api/groupApi';
import { getCourses } from '../../../api/courseApi';
import { getTeachers } from '../../../api/teacherApi';
import '../style.css';

export default function EditSchedule() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { schedules, setSchedules } = useOutletContext();

    const [form, setForm] = useState(null);
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');

    function toLocalDateInputValue(iso) {
        const d = new Date(iso);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().split('T')[0];
    }

    useEffect(() => {
        (async () => {
            const res = await getSchedule(id);
            setForm({
                ...res.data,
                ngaybd: toLocalDateInputValue(res.data.ngaybd),
                ngaykt: toLocalDateInputValue(res.data.ngaykt),
            });
        })();

        (async () => {
            try {
                const [gRes, cRes, tRes] = await Promise.all([
                    getGroups(),
                    getCourses(),
                    getTeachers(),
                ]);

                const courseMap = Object.fromEntries(cRes.data.map(c => [c.mamh, c.tenmh]));
                const teacherMap = Object.fromEntries(tRes.data.map(t => [t.mgv, t.ten]));

                const opts = gRes.data.map(g => ({
                    value: g.manhom,
                    label: `Mã nhóm: ${g.manhom} – ${g.tennhom} – Môn: ${courseMap[g.mamh] || g.mamh} – GV: ${teacherMap[g.mgv] || g.mgv} – ${g.tenphong} – Khu ${g.khu}`
                }));

                setOptions(opts);
            } catch (e) {
                console.error('Không thể tải dữ liệu nhóm.', e);
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

        if (!form.manhom) {
            setError('Vui lòng chọn nhóm');
            return;
        }

        if (parseInt(form.tietbd) >= parseInt(form.tietkt)) {
            setError('Tiết bắt đầu phải nhỏ hơn tiết kết thúc');
            return;
        }

        try {
            const res = await updateSchedule(id, form);
            setSchedules(schedules.map(s => (s.id === res.data.id ? res.data : s)));
            navigate('/admin/lichhoc');
        } catch (err) {
            console.error('Lỗi khi cập nhật lịch học', err);
            setError('Lỗi khi cập nhật lịch học');
        }
    };

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <Select
                    isLoading={loadingOpts}
                    options={options}
                    value={options.find(o => o.value === form.manhom) || null}
                    onChange={opt => setForm(f => ({ ...f, manhom: opt?.value || '' }))}
                    isClearable
                    placeholder="Chọn nhóm..."
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
                {error && <div className="error-message">{error}</div>}

                <label>Thứ*</label>
                <select name="thu" value={form.thu} onChange={onChange}>
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                    ))}
                </select>

                <label>Tiết bắt đầu*</label>
                <input name="tietbd" type="number" min="1" value={form.tietbd} onChange={onChange} required />

                <label>Tiết kết thúc*</label>
                <input name="tietkt" type="number" min={parseInt(form.tietbd) + 1} value={form.tietkt} onChange={onChange} required />

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
