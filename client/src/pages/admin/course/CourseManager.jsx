// src/pages/admin/course/CourseManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { getCourses, deleteCourse } from '../../../api/courseApi';
import '../style.css';

export default function CourseManager() {
    const nav = useNavigate();
    const { courses, setCourses } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');


    const fetch = async () => {
        setLoading(true);
        const res = await getCourses();
        setCourses(res.data);
        setLoading(false);
    };
    useEffect(() => { fetch() }, []);

    const khoaOptions = Array.from(new Set(courses.map(c => c.khoa))).sort();

    // 3) Lọc theo search text và khoa
    const filtered = courses.filter(c => {
        const term = search.toLowerCase();
        const matchText =
            c.mamh.includes(term) ||
            c.tenmh.toLowerCase().includes(term);
        const matchKhoa = !filterKhoa || c.khoa === filterKhoa;
        return matchText && matchKhoa;
    });
    const customStyles = {
        table: {
            style: {
                backgroundColor: '#f9f9f9',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#e0e0e0',
                fontWeight: 'bold',
            },
        },
        headCells: {
            style: {
                fontSize: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                backgroundColor: '#fff',
                '&:hover': {
                    backgroundColor: '#f1f1f1',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
    };

    const columns = [
        { name: 'Mã MH', selector: r => r.mamh, sortable: true },
        { name: 'Tên MH', selector: r => r.tenmh, sortable: true },
        { name: 'Tín chỉ', selector: r => r.sotinchi },
        { name: 'Khoa', selector: r => r.khoa },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => nav(`/admin/courses/edit/${r.mamh}`)} style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Sửa</button>
                    <button onClick={async () => { await deleteCourse(r.mamh); fetch() }} style={{ width: 50, padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}>Xóa</button>
                </div>
            ), ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Môn học</h1>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input placeholder="Tìm mã hoặc tên" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 10, width: 280, fontSize: 16 }} />
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 10, fontSize: 16 }}
                >
                    <option value="">-- Tất cả khoa --</option>
                    {khoaOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button onClick={() => nav('/admin/courses/add')} style={{
                    padding: '15px 20px',
                    backgroundColor: '#0c4ca3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 'bold',
                }}>Thêm Môn học</button>
            </div>
            <DataTable columns={columns} data={filtered} pagination progressPending={loading} persistTableHead={true} customStyles={customStyles}      // luôn giữ header
            />
        </div>
    );
}
