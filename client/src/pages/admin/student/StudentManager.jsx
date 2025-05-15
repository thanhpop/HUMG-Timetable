import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getStudents, deleteStudent as apiDelete } from '../../../api/studentApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';
export default function StudentManager() {
    const navigate = useNavigate();
    const { students, setStudents } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');
    const [filterKhoaHoc, setFilterKhoaHoc] = useState('');

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
    const handleDelete = async msv => {
        if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
            await apiDelete(msv);
            fetchStudents();
        }
    };
    const khoaOptions = Array.from(new Set(students.map(s => s.khoa))).sort();

    // 3) Lọc theo searchTerm và filterKhoa
    const filtered = (students || []).filter(s => {
        const term = searchTerm.toLowerCase();
        // phòng vệ: nếu s.msv hoặc s.ten undefined thì dùng chuỗi rỗng
        const msvLower = (s.msv ?? '').toLowerCase();
        const tenLower = (s.ten ?? '').toLowerCase();
        const matchText =
            msvLower.includes(term) ||
            tenLower.includes(term);
        const matchKhoa = !filterKhoa || s.khoa === filterKhoa;
        const matchKhoaHoc = !filterKhoaHoc || s.khoaHoc === filterKhoaHoc;
        return matchText && matchKhoa && matchKhoaHoc;
    });

    // Tìm kiếm sinh viên theo tên hoặc MSV
    const handleSearch = e => setSearchTerm(e.target.value);


    const columns = [
        { name: 'MSV', selector: row => row.msv, sortable: true },
        { name: 'Tên', selector: row => row.ten, sortable: true },
        { name: 'Khoa', selector: row => row.khoa, sortable: true },
        { name: 'Lớp', selector: row => row.lop, sortable: true },
        { name: 'Khóa', selector: row => row.khoaHoc, sortable: true },

        { name: 'Giới tính', selector: row => row.gioitinh },
        { name: 'Ngày sinh', selector: row => new Date(row.ngaysinh).toLocaleDateString('vi-VN'), },
        {
            name: 'Hành động',
            cell: row => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button
                        onClick={() => navigate(`/admin/students/view/${row.msv}`)}
                        className="btn-view"
                    >
                        Xem
                    </button>
                    <button
                        onClick={() => navigate(`/admin/students/edit/${row.msv}`)}
                        className="btn-edit"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDelete(row.msv)}
                        className="btn-delete"
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
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 8, fontSize: 14 }}
                >
                    <option key="all" value="">
                        -- Tất cả khoa --
                    </option>
                    {khoaOptions.map(k => (
                        <option key={k} value={k}>
                            {k}
                        </option>
                    ))}
                </select>
                <select
                    value={filterKhoaHoc}
                    onChange={e => setFilterKhoaHoc(e.target.value)}
                    style={{ padding: 8, fontSize: 14 }}
                >
                    <option value="">-- Tất cả khóa học --</option>
                    {[...new Set(students.map(s => s.khoaHoc))].map(kh => (
                        <option key={kh} value={kh}>{kh}</option>
                    ))}
                </select>
            </div>


            <div style={{ marginBottom: 16, textAlign: 'right', }}>
                <button
                    onClick={() => navigate('/admin/students/add')}
                    className="btn-add"
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
