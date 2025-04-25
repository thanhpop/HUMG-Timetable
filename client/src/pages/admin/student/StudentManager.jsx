import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getStudents, deleteStudent as apiDelete } from '../../../api/studentApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './style.css';
export default function StudentManager() {
    const navigate = useNavigate();
    const { students, setStudents } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await getStudents();
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);



    // Xóa sinh viên
    const handleDelete = async id => {
        if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
            await apiDelete(id);
            fetchStudents();
        }
    };
    const filtered = students.filter(
        s =>
            s.msv.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tìm kiếm sinh viên theo tên hoặc MSV
    const handleSearch = e => setSearchTerm(e.target.value);

    const filteredStudents = students.filter(
        s =>
            s.msv.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { name: 'MSV', selector: row => row.msv, sortable: true },
        { name: 'Tên', selector: row => row.name, sortable: true },
        { name: 'Khoa', selector: row => row.khoa, sortable: true },
        { name: 'Lớp', selector: row => row.lop, sortable: true },
        { name: 'Giới tính', selector: row => row.gender },
        { name: 'Ngày sinh', selector: row => new Date(row.dob).toLocaleDateString('vi-VN'), },
        {
            name: 'Hành động',
            cell: row => (
                <div style={{ display: 'flex', gap: 1 }}>
                    <button
                        onClick={() => navigate(`/admin/students/view/${row.id}`)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Xem
                    </button>
                    <button
                        onClick={() => navigate(`/admin/students/edit/${row.id}`)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        style={{ width: 50, padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                        Xóa
                    </button>
                </div >
            ),
            ignoreRowClick: true,


        },
    ];

    const customStyles = {
        table: {
            style: {
                backgroundColor: '#f9f9f9',
                fontSize: '18px',
                width: '100%',
                maxWidth: '100%',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#e0e0e0',
                fontWeight: 'bold',
                minHeight: '56px',
            },
        },
        headCells: {
            style: {
                fontSize: '18px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                backgroundColor: '#fff',
                minHeight: '48px',
                fontSize: '16px',
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

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ textAlign: 'left', marginBottom: 16 }}>Quản lý sinh viên</h1>
            <div className="search-container">

                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm MSV hoặc tên"
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ padding: 10, width: 280, fontSize: 16 }}
                />
            </div>

            <div style={{ marginBottom: 16, textAlign: 'right', }}>
                <button
                    onClick={() => navigate('/admin/students/add')}
                    style={{
                        padding: '15px 20px',
                        backgroundColor: '#0c4ca3',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontWeight: 'bold',
                    }}
                >
                    Thêm sinh viên
                </button>
            </div>

            {/* DataTable */}
            <div className="table-responsive">
                <DataTable
                    columns={columns}
                    data={filtered}
                    pagination
                    highlightOnHover
                    defaultSortField="msv"
                    customStyles={customStyles}
                    persistTableHead={true}
                    progressPending={loading}
                />
            </div>
        </div>
    );
}
