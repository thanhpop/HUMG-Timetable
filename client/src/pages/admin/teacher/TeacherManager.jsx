// src/pages/admin/teacher/TeacherManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getTeachers, deleteTeacher as apiDelete } from '../../../api/teacherApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function TeacherManager() {
    const navigate = useNavigate();
    const { teachers, setTeachers } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await getTeachers();
            setTeachers(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleDelete = async mgv => {
        if (window.confirm('Bạn có chắc muốn xóa giáo viên này?')) {
            await apiDelete(mgv);
            fetchTeachers();
        }
    };

    // ② danh sách các khoa duy nhất
    const khoaOptions = Array.from(new Set(teachers.map(t => t.khoa))).sort();

    // ③ lọc theo searchTerm và filterKhoa
    const filtered = (teachers || []).filter(t => {
        const term = searchTerm.toLowerCase();
        const matchText =
            t.mgv.toString().includes(term) ||
            t.ten.toLowerCase().includes(term);
        const matchKhoa = !filterKhoa || t.khoa === filterKhoa;
        return matchText && matchKhoa;
    });

    const columns = [
        { name: 'Mã GV', selector: row => row.mgv, sortable: true },
        { name: 'Họ và tên', selector: row => row.ten, sortable: true },
        { name: 'Khoa', selector: row => row.khoa, sortable: true },
        { name: 'Giới tính', selector: row => row.gioitinh },
        { name: 'Email', selector: row => row.email },
        { name: 'Số ĐT', selector: row => row.sdt },
        {
            name: 'Hành động',
            cell: row => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        onClick={() => navigate(`/admin/teachers/view/${row.mgv}`)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Xem
                    </button>
                    <button
                        onClick={() => navigate(`/admin/teachers/edit/${row.mgv}`)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDelete(row.mgv)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Xóa
                    </button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    const customStyles = {
        table: { style: { backgroundColor: '#f9f9f9' } },
        headRow: { style: { backgroundColor: '#e0e0e0', fontWeight: 'bold' } },
        headCells: { style: { fontSize: '16px', paddingLeft: '16px', paddingRight: '16px' } },
        rows: { style: { backgroundColor: '#fff', '&:hover': { backgroundColor: '#f1f1f1' } } },
        cells: { style: { paddingLeft: '16px', paddingRight: '16px' } },
    };

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ textAlign: 'left', marginBottom: 16 }}>Quản lý giáo viên</h1>

            <div className="search-container" style={{ marginBottom: 16 }}>
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm Mã GV hoặc tên"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ padding: 10, width: 280, fontSize: 16 }}
                />
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 8, fontSize: 14 }}
                >
                    <option value="">--Tất cả khoa--</option>
                    {khoaOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button
                    onClick={() => navigate('/admin/teachers/add')}
                    style={{
                        padding: '15px 20px',
                        backgroundColor: '#0c4ca3',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontWeight: 'bold',
                    }}
                >
                    Thêm giáo viên
                </button>
            </div>

            <div className="table-responsive">
                <DataTable
                    columns={columns}
                    data={filtered}
                    pagination
                    highlightOnHover
                    defaultSortField="mgv"
                    customStyles={customStyles}
                    persistTableHead={true}
                    progressPending={loading}

                />
            </div>
        </div>
    );
}
