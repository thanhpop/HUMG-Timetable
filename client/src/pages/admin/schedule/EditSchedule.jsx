// src/pages/admin/schedule/EditSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { getSchedule, getSchedulesByGroup, updateSchedule, deleteSchedule, createSchedule } from '../../../api/scheduleApi';
import { getGroups } from '../../../api/groupApi';
import { getCourses } from '../../../api/courseApi';
import { getTeachers } from '../../../api/teacherApi';
import { getRooms } from '../../../api/roomApi';
import '../style.css';

export default function EditSchedule() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { schedules, setSchedules } = useOutletContext();

    const [form, setForm] = useState({ manhom: '', sessions: [] });
    const [originalSessions, setOriginalSessions] = useState([]);
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');

    function toLocalDate(iso) {
        const d = new Date(iso);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().split('T')[0];
    }

    useEffect(() => {
        // 1) load tất cả session của nhóm
        (async () => {
            const res0 = await getSchedule(id);
            const manhom = res0.data.manhom;
            const resAll = await getSchedulesByGroup(manhom);
            const sessions = resAll.data.map(s => ({
                id: s.id,
                thu: s.thu,
                tietbd: s.tietbd,
                tietkt: s.tietkt,
                ngaybd: toLocalDate(s.ngaybd),
                ngaykt: toLocalDate(s.ngaykt)
            }));
            setForm({ manhom, sessions });
            setOriginalSessions(sessions.map(s => s.id));
        })();

        // 2) load các option cho select nhóm
        (async () => {
            try {
                const [gRes, cRes, tRes, rRes] = await Promise.all([
                    getGroups(), getCourses(), getTeachers(), getRooms()
                ]);
                const courseMap = Object.fromEntries(cRes.data.map(c => [c.mamh, c.tenmh]));
                const teacherMap = Object.fromEntries(tRes.data.map(t => [t.mgv, t.ten]));
                const roomMap = Object.fromEntries(rRes.data.map(r => [r.maphong, { tenphong: r.tenphong, khu: r.khu }]));

                setOptions(
                    gRes.data.map(g => {
                        const room = roomMap[g.maphong] || {};
                        return {
                            value: g.manhom,
                            label: [
                                `Mã nhóm: ${g.manhom}`,
                                `Tên nhóm: ${g.tennhom}`,
                                `Môn: ${courseMap[g.mamh] || g.mamh}`,
                                `GV: ${teacherMap[g.mgv] || g.mgv}`,
                                `Phòng: ${room.tenphong || g.maphong}`,
                                `Khu: ${room.khu || ''}`
                            ].join(' – ')
                        };
                    })
                );
            } finally {
                setLoadingOpts(false);
            }
        })();
    }, [id]);

    const onGroupChange = opt => {
        setForm(f => ({ ...f, manhom: opt ? opt.value : '' }));
        setError('');
    };

    const onSessionChange = (i, field, v) => {
        setForm(f => {
            const sessions = f.sessions.slice();
            sessions[i] = { ...sessions[i], [field]: v };
            return { ...f, sessions };
        });
    };

    const addSession = () => {
        if (form.sessions.length < 7) {
            setForm(f => ({
                ...f,
                sessions: [...f.sessions, { thu: 2, tietbd: 1, tietkt: 2, ngaybd: '', ngaykt: '' }]
            }));
        }
    };

    const removeSession = i => {
        setForm(f => ({
            ...f,
            sessions: f.sessions.filter((_, idx) => idx !== i)
        }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!form.manhom) { setError('Vui lòng chọn nhóm'); return; }

        // kiểm tra logic
        for (let s of form.sessions) {
            if (!s.ngaybd || !s.ngaykt || parseInt(s.tietbd) >= parseInt(s.tietkt)) {
                setError('Kiểm tra lại dữ liệu buổi học'); return;
            }
        }

        try {
            // 1. Tìm các buổi đã bị xóa
            const currentIds = form.sessions.map(s => s.id).filter(Boolean); // chỉ những buổi có id
            const deletedIds = originalSessions.filter(id => !currentIds.includes(id));

            // 2. Xóa các buổi đã bị loại khỏi form
            await Promise.all(deletedIds.map(id => deleteSchedule(id)));

            // 3. Tạo mới hoặc cập nhật các buổi còn lại
            await Promise.all(form.sessions.map(s => {
                if (s.id) {
                    return updateSchedule(s.id, {
                        manhom: form.manhom,
                        thu: s.thu,
                        tietbd: s.tietbd,
                        tietkt: s.tietkt,
                        ngaybd: s.ngaybd,
                        ngaykt: s.ngaykt
                    });
                } else {
                    return createSchedule({
                        manhom: form.manhom,
                        thu: s.thu,
                        tietbd: s.tietbd,
                        tietkt: s.tietkt,
                        ngaybd: s.ngaybd,
                        ngaykt: s.ngaykt
                    });
                }
            }));

            const refreshed = await getSchedulesByGroup(form.manhom);
            setSchedules(prev => [
                ...refreshed.data,
                ...prev.filter(x => x.manhom !== form.manhom)
            ]);
            navigate('/admin/lichhoc');
        } catch (err) {
            console.error(err);
            setError('Lỗi khi lưu lịch');
        }
    };

    if (!form.sessions) return <div>Loading…</div>;

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <Select
                    isLoading={loadingOpts}
                    options={options}
                    value={options.find(o => o.value === form.manhom) || null}
                    onChange={onGroupChange}
                    placeholder="Chọn nhóm..."
                    isClearable
                    styles={{
                        control: base => ({ ...base, backgroundColor: 'black', borderColor: '#555', width: '450px' }),
                        singleValue: base => ({ ...base, color: 'white' }),
                        menu: base => ({ ...base, backgroundColor: 'black' }),
                        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#333' : 'black', color: 'white' }),
                        placeholder: base => ({ ...base, color: '#ccc' }),
                        input: base => ({ ...base, color: 'white' }),
                    }}
                />
                {error && <div className="error-message">{error}</div>}

                {form.sessions.map((s, idx) => (
                    <fieldset key={idx} className="session-block">
                        <legend>Buổi {idx + 1}</legend>

                        <label>Thứ*</label>
                        <select value={s.thu} onChange={e => onSessionChange(idx, 'thu', Number(e.target.value))}>
                            {[2, 3, 4, 5, 6, 7, 8].map(n => (
                                <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                            ))}
                        </select>

                        <label>Tiết bắt đầu*</label>
                        <input type="number" min="1" value={s.tietbd}
                            onChange={e => onSessionChange(idx, 'tietbd', e.target.value)} required />

                        <label>Tiết kết thúc*</label>
                        <input type="number" min={parseInt(s.tietbd) + 1} value={s.tietkt}
                            onChange={e => onSessionChange(idx, 'tietkt', e.target.value)} required />

                        <label>Ngày bắt đầu*</label>
                        <input type="date" value={s.ngaybd}
                            onChange={e => onSessionChange(idx, 'ngaybd', e.target.value)} required />

                        <label>Ngày kết thúc*</label>
                        <input type="date" min={s.ngaybd} value={s.ngaykt}
                            onChange={e => onSessionChange(idx, 'ngaykt', e.target.value)} required />

                        {form.sessions.length > 1 && (
                            <button
                                type="button"
                                className="btn-small btn-remove"
                                onClick={() => removeSession(idx)}
                            >
                                Xóa buổi
                            </button>
                        )}
                    </fieldset>
                ))}

                <button type="button" className="btn-add-session" onClick={addSession} disabled={form.sessions.length >= 7}>
                    + Thêm buổi
                </button>

                <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                    <button type="submit">Lưu tất cả</button>
                    <button type="button" onClick={() => navigate(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
