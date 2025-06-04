// src/pages/admin/group/EditGroup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { getGroup, updateGroup } from '../../../api/groupApi';
import {
    getAllCourses,
    getAllTeachers,
    getAllSemesters
} from '../../../api/utilsApi';
import '../style.css';

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
    singleValue: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: '#ccc' }),
    input: (base) => ({
        ...base,
        color: '#fff',
    }),
};

export default function EditGroup() {
    const nav = useNavigate();
    const { manhom } = useParams();         // đây là oldManhom
    const { groups, setGroups } = useOutletContext();

    const [form, setForm] = useState({
        manhom: '',
        tennhom: '',
        mamh: '',
        mgv: '',
        mahk: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Load dữ liệu ban đầu
    useEffect(() => {
        (async () => {
            try {
                const [{ data: grp }, cRes, tRes, sRes] = await Promise.all([
                    getGroup(manhom),
                    getAllCourses(),
                    getAllTeachers(),
                    getAllSemesters()
                ]);

                setForm({
                    manhom: grp.manhom,
                    tennhom: grp.tennhom,
                    mamh: grp.mamh,
                    mgv: grp.mgv,
                    mahk: grp.mahk
                });
                setCourses(cRes.data);
                setTeachers(tRes.data);
                setSemesters(sRes.data);
            } catch (e) {
                console.error(e);
                setError('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        })();
    }, [manhom]);

    const onInput = (name) => (option) => {
        const value = option ? option.value : '';
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'manhom') setError('');
    };

    const onTextChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (name === 'manhom') setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();

        // 1. Kiểm tra trùng lặp local: nếu form.manhom trùng với bất kỳ g.manhom nào
        //    khác với oldManhom, báo lỗi
        if (groups.some(g => g.manhom === form.manhom && g.manhom !== manhom)) {
            setError('Mã nhóm trùng');
            return;
        }

        // 2. Chuẩn bị payload: backend mong có `newManhom`, không phải `manhom`
        const payload = {
            newManhom: form.manhom,
            tennhom: form.tennhom,
            mamh: form.mamh,
            mgv: form.mgv,
            mahk: form.mahk,
        };

        try {
            // Gọi updateGroup với oldManhom (req.params) và payload mới
            const res = await updateGroup(manhom, payload);
            // res.data là object nhóm đã update (chứa manhom mới)

            // 3. Cập nhật mảng groups: tìm item có manhom === oldManhom, thay bằng res.data
            setGroups(groups.map(g =>
                g.manhom === manhom  // oldManhom
                    ? res.data         // object mới (đã có newManhom)
                    : g
            ));

            nav('/admin/groups');
        } catch (err) {
            // Bắt lỗi do backend trả về, ví dụ ER_DUP_ENTRY hoặc lỗi khác
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                console.error(err);
                setError('Có lỗi khi cập nhật nhóm.');
            }
        }
    };

    if (loading) return <div>Đang tải…</div>;

    return (
        <div className="form-card">
            <h2>Chỉnh sửa Nhóm môn học</h2>
            <form onSubmit={onSubmit} className="two-column-form">

                <label>
                    Mã nhóm<span style={{ color: 'red' }}>(*)</span>
                </label>
                <input
                    name="manhom"
                    value={form.manhom}
                    onChange={onTextChange}
                    required
                />
                {error && <div className="error-message">{error}</div>}

                <label>
                    Tên nhóm<span style={{ color: 'red' }}>(*)</span>
                </label>
                <input
                    name="tennhom"
                    value={form.tennhom}
                    onChange={onTextChange}
                    required
                />

                <label>
                    Mã môn học<span style={{ color: 'red' }}>(*)</span>
                </label>
                <Select
                    styles={customSelectStyles}
                    options={courses.map(c => ({ value: c.mamh, label: `${c.mamh} – ${c.tenmh}` }))}
                    value={
                        courses.find(c => c.mamh === form.mamh)
                            ? {
                                value: form.mamh,
                                label: `${form.mamh} – ${courses.find(c => c.mamh === form.mamh).tenmh}`
                            }
                            : null
                    }
                    onChange={onInput('mamh')}
                    placeholder="Chọn môn học"
                    isClearable
                />

                <label>
                    Mã giảng viên<span style={{ color: 'red' }}>(*)</span>
                </label>
                <Select
                    styles={customSelectStyles}
                    options={teachers.map(t => ({ value: t.mgv, label: `${t.mgv} – ${t.ten}` }))}
                    value={
                        teachers.find(t => t.mgv === form.mgv)
                            ? {
                                value: form.mgv,
                                label: `${form.mgv} – ${teachers.find(t => t.mgv === form.mgv).ten}`
                            }
                            : null
                    }
                    onChange={onInput('mgv')}
                    placeholder="Chọn giảng viên"
                    isClearable
                />

                <label>
                    Mã học kỳ<span style={{ color: 'red' }}>(*)</span>
                </label>
                <Select
                    styles={customSelectStyles}
                    options={semesters.map(s => ({
                        value: s.mahk,
                        label: `${s.mahk} – ${s.tenhk} – ${s.namhoc}`
                    }))}
                    value={
                        (() => {
                            const sel = semesters.find(s => s.mahk === form.mahk);
                            return sel
                                ? { value: sel.mahk, label: `Mã HK: ${sel.mahk} – ${sel.tenhk} – ${sel.namhoc}` }
                                : null;
                        })()
                    }
                    onChange={onInput('mahk')}
                    placeholder="Chọn học kỳ"
                    isClearable
                />

                <div className="form-actions">
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={() => nav(-1)}>Hủy</button>
                </div>
            </form>
        </div>
    );
}
