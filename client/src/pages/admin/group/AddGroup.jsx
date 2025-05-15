// src/pages/admin/group/AddGroup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { createGroup } from '../../../api/groupApi';
import {
    getAllCourses,
    getAllTeachers,
    getAllRooms,
    getAllSemesters
} from '../../../api/utilsApi';
import '../style.css';

export default function AddGroup() {
    const nav = useNavigate();
    const { groups, setGroups } = useOutletContext();

    const [form, setForm] = useState({
        manhom: '',
        tennhom: '',
        mamh: '',
        mgv: '',
        mahk: ''
    });
    const [error, setError] = useState('');

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: '#000',
            color: '#fff',
            borderColor: '#444',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#000',
            maxHeight: 200,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#222' : '#000',
            color: '#fff',
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#ccc',
        }),
        input: (base) => ({
            ...base,
            color: '#fff',
        }),
    };

    // Load reference data
    useEffect(() => {
        (async () => {
            try {
                const [cRes, tRes, rRes, sRes] = await Promise.all([
                    getAllCourses(),
                    getAllTeachers(),
                    getAllRooms(),
                    getAllSemesters()
                ]);
                setCourses(cRes.data.map(c => ({ value: c.mamh, label: `Mã môn học: ${c.mamh} – ${c.tenmh}` })));
                setTeachers(tRes.data.map(t => ({ value: t.mgv, label: `Mã GV: ${t.mgv} – ${t.ten}` })));
                setSemesters(sRes.data.map(s => ({ value: s.mahk, label: `Mã HK: ${s.mahk} – ${s.tenhk}` })));
            } catch (err) {
                console.error('Lỗi tải dữ liệu tham chiếu:', err);
                setError('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onInput = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'manhom') setError('');
    };

    const onSelect = (field) => option => {
        setForm(f => ({ ...f, [field]: option ? option.value : '' }));
        if (field === 'manhom') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (groups.some(g => g.manhom === form.manhom)) {
            setError('Mã nhóm đã tồn tại');
            return;
        }
        if (!form.mahk) {
            setError('Vui lòng chọn học kỳ');
            return;
        }
        const res = await createGroup(form);
        setGroups([res.data, ...groups]);
        nav('/admin/groups');
    };

    if (loading) return <div>Đang tải dữ liệu…</div>;

    return (
        <div className="form-card">
            <h2>Thêm Nhóm môn học</h2>
            <form onSubmit={onSubmit} className="two-column-form">
                <label>Mã nhóm*</label>
                <input name="manhom" value={form.manhom} onChange={onInput} required />
                {error && <div className="error-message">{error}</div>}

                <label>Tên nhóm*</label>
                <input name="tennhom" value={form.tennhom} onChange={onInput} required />

                <label>Mã môn học*</label>
                <Select
                    options={courses}
                    value={courses.find(c => c.value === form.mamh) || null}
                    onChange={onSelect('mamh')}
                    placeholder="Chọn môn học"
                    isClearable
                    styles={customSelectStyles}
                />

                <label>Mã giảng viên*</label>
                <Select
                    options={teachers}
                    value={teachers.find(t => t.value === form.mgv) || null}
                    onChange={onSelect('mgv')}
                    placeholder="Chọn giảng viên"
                    isClearable
                    styles={customSelectStyles}
                />


                <label>Mã học kỳ*</label>
                <Select
                    options={semesters}
                    value={semesters.find(s => s.value === form.mahk) || null}
                    onChange={onSelect('mahk')}
                    placeholder="Chọn học kỳ"
                    isClearable
                    styles={customSelectStyles}
                />

                <div className="form-actions">
                    <button type="submit">Thêm</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
