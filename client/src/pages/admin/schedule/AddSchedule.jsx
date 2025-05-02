import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { createSchedule } from '../../../api/scheduleApi';
import { getGroups } from '../../../api/groupApi';
import { getCourses } from '../../../api/courseApi';
import { getTeachers } from '../../../api/teacherApi';
import '../style.css';

export default function AddSchedule() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();

    const [form, setForm] = useState({
        manhom: '',
        thu: 2,
        tietbd: 1,
        tietkt: 2,
        ngaybd: '',
        ngaykt: ''
    });

    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const [gRes, cRes, tRes] = await Promise.all([
                    getGroups(),   // [{ manhom, mamh, mgv, tennhom }]
                    getCourses(),  // [{ mamh, tenmh }]
                    getTeachers()  // [{ mgv, ten }]
                ]);

                const groups = gRes.data;
                const courseMap = Object.fromEntries(cRes.data.map(c => [c.mamh, c.tenmh]));
                const teacherMap = Object.fromEntries(tRes.data.map(t => [t.mgv, t.ten]));

                const opts = groups.map(g => ({
                    value: g.manhom,
                    label: `Mã nhóm: ${g.manhom} – ${g.tennhom} – ${courseMap[g.mamh] || g.mamh} – ${teacherMap[g.mgv] || g.mgv}`
                }));

                setOptions(opts);
            } catch (e) {
                console.error('Không thể tải dữ liệu nhóm.', e);
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

        if (parseInt(form.tietbd) >= parseInt(form.tietkt)) {
            setError('Tiết bắt đầu phải nhỏ hơn tiết kết thúc');
            return;
        }

        try {
            const res = await createSchedule(form);
            setSchedules([res.data, ...schedules]);
            navigate('/admin/lichhoc');
        } catch (err) {
            console.error('Lỗi khi tạo lịch học', err);
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
                    onChange={opt => setForm(f => ({ ...f, manhom: opt.value }))}
                    placeholder="Chọn nhóm..."
                    isClearable
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: 'black',
                            color: 'white',
                            borderColor: '#555',
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'white',
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: 'black',
                            color: 'white',
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#333' : 'black',
                            color: 'white',
                            cursor: 'pointer',
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: '#ccc',
                        }),
                        input: (base) => ({
                            ...base,
                            color: 'white',
                        }),
                    }}
                />
                {error && <div className="error-message">{error}</div>}

                <label>Thứ*</label>
                <select name="thu" value={form.thu} onChange={onInput}>
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Thứ {n === 8 ? 'CN' : n}</option>
                    ))}
                </select>

                <label>Tiết bắt đầu*</label>
                <input
                    name="tietbd"
                    type="number"
                    min="1"
                    value={form.tietbd}
                    onChange={onInput}
                    required
                />

                <label>Tiết kết thúc*</label>
                <input
                    name="tietkt"
                    type="number"
                    min={parseInt(form.tietbd) + 1}
                    value={form.tietkt}
                    onChange={onInput}
                    required
                />

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
