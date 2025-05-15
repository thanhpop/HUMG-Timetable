// src/pages/admin/schedule/EditSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import {
    getSchedule,
    getSchedulesByGroup,
    updateSchedule,
    deleteSchedule,
    createSchedule
} from '../../../api/scheduleApi';
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
    const [roomOptions, setRoomOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');

    const selectStyles = {
        control: base => ({ ...base, backgroundColor: 'black', borderColor: '#555', width: 450 }),
        singleValue: base => ({ ...base, color: 'white' }),
        menu: base => ({ ...base, backgroundColor: 'black' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#333' : 'black',
            color: 'white'
        }),
        placeholder: base => ({ ...base, color: '#ccc' }),
        input: base => ({ ...base, color: 'white' }),
    };

    function toLocalDate(iso) {
        const d = new Date(iso);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().split('T')[0];
    }

    useEffect(() => {
        (async () => {
            // 1) load schedule và sessions cùng nhóm
            const res0 = await getSchedule(id);
            const manhom = res0.data.manhom;
            const resAll = await getSchedulesByGroup(manhom);
            const sessions = resAll.data.map(s => ({
                id: s.id,
                thu: s.thu,
                tietbd: s.tietbd,
                tietkt: s.tietkt,
                ngaybd: toLocalDate(s.ngaybd),
                ngaykt: toLocalDate(s.ngaykt),
                maphong: s.maphong  // nhớ mang cả maphong về
            }));
            setForm({ manhom, sessions });
            setOriginalSessions(sessions.map(s => s.id));

            // 2) load các options
            const [gRes, cRes, tRes, rRes] = await Promise.all([
                getGroups(), getCourses(), getTeachers(), getRooms()
            ]);
            const courseMap = Object.fromEntries(cRes.data.map(c => [c.mamh, c.tenmh]));
            const teacherMap = Object.fromEntries(tRes.data.map(t => [t.mgv, t.ten]));
            // build roomOptions
            setRoomOptions(rRes.data.map(r => ({
                value: r.maphong,
                label: `${r.tenphong} – Khu ${r.khu}`
            })));

            setOptions(
                gRes.data.map(g => ({
                    value: g.manhom,
                    label: [
                        `Mã nhóm: ${g.manhom}`,
                        `Tên nhóm: ${g.tennhom}`,
                        `Môn: ${courseMap[g.mamh] || g.mamh}`,
                        `GV: ${teacherMap[g.mgv] || g.mgv}`
                    ].join(' – ')
                }))
            );
            setLoadingOpts(false);
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
                sessions: [
                    ...f.sessions,
                    { thu: 2, tietbd: 1, tietkt: 2, ngaybd: '', ngaykt: '', maphong: '' }
                ]
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
        // validate
        for (let s of form.sessions) {
            if (!s.ngaybd || !s.ngaykt || parseInt(s.tietbd) >= parseInt(s.tietkt) || !s.maphong) {
                setError('Kiểm tra lại dữ liệu buổi học'); return;
            }
        }
        const sessions = form.sessions;
        for (let i = 0; i < sessions.length; i++) {
            for (let j = i + 1; j < sessions.length; j++) {
                const a = sessions[i], b = sessions[j];
                if (a.thu !== b.thu) continue;
                if (a.ngaybd === b.ngaybd) {
                    alert(`Buổi ${j + 1} cùng Thứ ${a.thu} và cùng ngày ${a.ngaybd} với Buổi ${i + 1}`);
                    return;
                }
                if (a.ngaybd <= b.ngaykt && b.ngaybd <= a.ngaykt) {
                    if (a.tietbd <= b.tietkt && b.tietbd <= a.tietkt) {
                        alert(`Buổi ${j + 1} trùng/chéo lịch với Buổi ${i + 1}`);
                        return;
                    }
                }
            }
        }
        try {
            // 1) Xóa các buổi bị remove
            const currentIds = form.sessions.map(s => s.id).filter(Boolean);
            const deletedIds = originalSessions.filter(i => !currentIds.includes(i));
            await Promise.all(deletedIds.map(i => deleteSchedule(i)));

            // 2) Update/create
            await Promise.all(form.sessions.map(s => {
                const payload = {
                    manhom: form.manhom,
                    thu: s.thu,
                    tietbd: s.tietbd,
                    tietkt: s.tietkt,
                    ngaybd: s.ngaybd,
                    ngaykt: s.ngaykt,
                    maphong: s.maphong   // truyền maphong
                };
                if (s.id) return updateSchedule(s.id, payload);
                else return createSchedule(payload);
            }));

            // 3) refresh lại
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
                    styles={selectStyles}
                />
                {error && <div className="error-message">{error}</div>}

                {form.sessions.map((s, idx) => (
                    <fieldset key={idx} className="session-block">
                        <legend>Buổi {idx + 1}</legend>

                        <label>Thứ*</label>
                        <select
                            value={s.thu}
                            onChange={e => onSessionChange(idx, 'thu', Number(e.target.value))}
                        >
                            {[2, 3, 4, 5, 6, 7, 8].map(n =>
                                <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                            )}
                        </select>

                        <label>Phòng học*</label>
                        <Select
                            options={roomOptions}
                            value={roomOptions.find(r => r.value === s.maphong) || null}
                            onChange={opt => onSessionChange(idx, 'maphong', opt ? opt.value : '')}
                            placeholder="Chọn phòng..."
                            styles={{

                                menu: base => ({ ...base, maxHeight: 200, backgroundColor: '#3B3B3B' }),
                                control: base => ({
                                    ...base,
                                    backgroundColor: '#3B3B3B',
                                    borderColor: '#555',

                                }),
                                singleValue: base => ({ ...base, color: 'white' }),

                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? '#333' : 'black',
                                    color: 'white'
                                }),
                                placeholder: base => ({ ...base, color: '#ccc' }),
                                input: base => ({ ...base, color: 'white' }),
                            }}
                        />

                        <label>Tiết bắt đầu*</label>
                        <input
                            type="number" min="1"
                            value={s.tietbd}
                            onChange={e => onSessionChange(idx, 'tietbd', e.target.value)}
                            required
                        />

                        <label>Tiết kết thúc*</label>
                        <input
                            type="number" min={parseInt(s.tietbd) + 1}
                            value={s.tietkt}
                            onChange={e => onSessionChange(idx, 'tietkt', e.target.value)}
                            required
                        />

                        <label>Ngày bắt đầu*</label>
                        <input
                            type="date"
                            value={s.ngaybd}
                            onChange={e => onSessionChange(idx, 'ngaybd', e.target.value)}
                            required
                        />

                        <label>Ngày kết thúc*</label>
                        <input
                            type="date" min={s.ngaybd}
                            value={s.ngaykt}
                            onChange={e => onSessionChange(idx, 'ngaykt', e.target.value)}
                            required
                        />

                        {form.sessions.length > 1 && (
                            <button type="button" className="btn-small btn-remove" onClick={() => removeSession(idx)}>
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
