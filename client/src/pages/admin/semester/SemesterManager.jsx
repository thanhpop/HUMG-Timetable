// src/pages/admin/semester/SemesterManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSemesters, deleteSemester } from '../../../api/semesterApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function SemesterManager() {
    const nav = useNavigate();
    const { semesters, setSemesters } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // fetch data
    const fetch = async () => {
        setLoading(true);
        try {
            const res = await getSemesters();
            setSemesters(res.data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetch(); }, []);

    // filter theo nhiều trường, ép thành string để dùng includes
    const filtered = semesters.filter(s => {
        const code = s.mahk.toString();
        const bd = new Date(s.ngaybd).toLocaleDateString('vi-VN');
        const kt = new Date(s.ngaykt).toLocaleDateString('vi-VN');
        return (
            code.includes(search) ||
            s.tenhk.toLowerCase().includes(search.toLowerCase()) ||
            s.namhoc.includes(search) ||
            bd.includes(search) ||
            kt.includes(search)
        );
    });

    // custom styles giống các module khác
    const customStyles = {
        table: {
            style: { backgroundColor: '#f9f9f9' },
        },
        headRow: {
            style: { backgroundColor: '#e0e0e0', fontWeight: 'bold' },
        },
        headCells: {
            style: { fontSize: '16px', paddingLeft: '16px', paddingRight: '16px' },
        },
        rows: {
            style: {
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f1f1f1' },
            },
        },
        cells: {
            style: { paddingLeft: '16px', paddingRight: '16px' },
        },
    };

    const columns = [
        { name: 'Mã HK', selector: r => r.mahk, sortable: true },
        { name: 'Tên HK', selector: r => r.tenhk, sortable: true },
        { name: 'Năm học', selector: r => r.namhoc, sortable: true },
        {
            name: 'Ngày bắt đầu',
            selector: r => new Date(r.ngaybd).toLocaleDateString('vi-VN'),
            sortable: true
        },
        {
            name: 'Ngày kết thúc',
            selector: r => new Date(r.ngaykt).toLocaleDateString('vi-VN'),
            sortable: true
        },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        onClick={() => nav(`/admin/semesters/edit/${r.mahk}`)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Sửa
                    </button>
                    <button
                        onClick={async () => { if (window.confirm('Xóa học kỳ này?')) { await deleteSemester(r.mahk); fetch(); } }}
                        style={{ width: 50, padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Xóa
                    </button>
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Học kỳ</h1>

            <div className="search-container" style={{ marginBottom: 16 }}>
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm mã, tên, năm học, ngày…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 8, width: 300, fontSize: 14 }}
                />
            </div>

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button
                    onClick={() => nav('/admin/semesters/add')}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontWeight: 'bold',
                    }}
                >
                    Thêm Học kỳ
                </button>
            </div>

            <DataTable
                columns={columns}
                data={filtered}
                pagination
                highlightOnHover
                persistTableHead
                progressPending={loading}
                customStyles={customStyles}
            />
        </div>
    );
}
