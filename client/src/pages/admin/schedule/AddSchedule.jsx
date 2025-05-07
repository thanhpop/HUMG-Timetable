// src/pages/admin/schedule/AddSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { createSchedule } from '../../../api/scheduleApi';
import { getGroups } from '../../../api/groupApi';
import { getCourses } from '../../../api/courseApi';
import { getTeachers } from '../../../api/teacherApi';
import { getRooms } from '../../../api/roomApi';
import '../style.css';

export default function AddSchedule() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();

    const [form, setForm] = useState({
        manhom: '',
        sessions: [
            { thu: 2, tietbd: 1, tietkt: 2, ngaybd: '', ngaykt: '' }
        ]
    });
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
                                `Nhóm: ${g.manhom}`,
                                g.tennhom,
                                `Môn: ${courseMap[g.mamh]}`,
                                `GV: ${teacherMap[g.mgv]}`,
                                `Phòng: ${room.tenphong}`,
                                `Khu: ${room.khu}`
                            ].join(' – ')
                        };
                    })
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingOpts(false);
            }
        })();
    }, []);

    const onGroupChange = opt => {
        setForm(f => ({ ...f, manhom: opt ? opt.value : '' }));
        setError('');
    };

    const onSessionChange = (idx, field, value) => {
        setForm(f => {
            const sessions = [...f.sessions];
            sessions[idx] = { ...sessions[idx], [field]: value };
            return { ...f, sessions };
        });
    };

    const addSession = () => {
        if (form.sessions.length < 7) {
            setForm(f => ({
                ...f,
                sessions: [
                    ...f.sessions,
                    { thu: 2, tietbd: 1, tietkt: 2, ngaybd: '', ngaykt: '' }
                ]
            }));
        }
    };

    const removeSession = idx => {
        setForm(f => ({
            ...f,
            sessions: f.sessions.filter((_, i) => i !== idx)
        }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!form.manhom) {
            setError('Vui lòng chọn nhóm');
            return;
        }
        for (let s of form.sessions) {
            if (parseInt(s.tietbd) >= parseInt(s.tietkt)) {
                setError('Tiết bắt đầu phải nhỏ hơn tiết kết thúc');
                return;
            }
            if (!s.ngaybd || !s.ngaykt) {
                setError('Vui lòng điền đủ ngày cho mỗi buổi');
                return;
            }
        }
        try {
            const created = [];
            for (let s of form.sessions) {
                const res = await createSchedule({
                    manhom: form.manhom,
                    thu: s.thu,
                    tietbd: s.tietbd,
                    tietkt: s.tietkt,
                    ngaybd: s.ngaybd,
                    ngaykt: s.ngaykt
                });
                created.push(res.data);
            }
            setSchedules([...created, ...schedules]);
            navigate('/admin/lichhoc');
        } catch {
            setError('Lỗi khi tạo lịch học');
        }
    };

    return (
        <div className="form-card">
            <h2>Thêm Lịch học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <Select
                    isLoading={loadingOpts}
                    options={options}
                    onChange={onGroupChange}
                    placeholder="Chọn nhóm..."
                    isClearable
                    styles={{
                        control: base => ({ ...base, backgroundColor: 'black', borderColor: '#555', width: '450px' }),
                        singleValue: base => ({ ...base, color: 'white' }),
                        menu: base => ({ ...base, backgroundColor: 'black' }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#333' : 'black',
                            color: 'white'
                        }),
                        placeholder: base => ({ ...base, color: '#ccc' }),
                        input: base => ({ ...base, color: 'white' })
                    }}
                />
                {error && <div className="error-message">{error}</div>}

                {/* render mỗi buổi trong fieldset để có border */}
                {form.sessions.map((s, idx) => (
                    <fieldset key={idx} className="session-block">
                        <legend>Buổi {idx + 1}</legend>

                        <label>Thứ*</label>
                        <select value={s.thu} onChange={e => onSessionChange(idx, 'thu', e.target.value)}>
                            {[2, 3, 4, 5, 6, 7, 8].map(n =>
                                <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                            )}
                        </select>

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

                <button
                    type="button"
                    className="btn-add-session"
                    onClick={addSession}
                    disabled={form.sessions.length >= 7}
                >
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
