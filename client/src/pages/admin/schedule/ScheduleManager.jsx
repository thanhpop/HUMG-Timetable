// src/pages/admin/schedule/ScheduleManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSchedules, deleteSchedule } from '../../../api/scheduleApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function ScheduleManager() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const filteredSchedules = schedules.filter(item =>
        item.mamh.toLowerCase().includes(search.toLowerCase()) ||
        item.tenmh.toLowerCase().includes(search.toLowerCase()) ||
        item.tennhom.toLowerCase().includes(search.toLowerCase()) ||
        item.tengv.toLowerCase().includes(search.toLowerCase())
    );
    const fetch = async () => {
        setLoading(true);
        const res = await getSchedules();
        setSchedules(res.data);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const customStyles = {
        headCells: {
            style: {
                fontSize: '15px',
                paddingLeft: '16px',
                paddingRight: '16px',
                border: '1px solid #e0e0e0', // Thêm border đầy đủ
                backgroundColor: '#f1f1f1',
            },
        },

        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRight: '1px solid #e0e0e0',
            },
        },
    };

    const columns = [
        {
            name: 'ID',
            selector: r => r.id,
            sortable: true,
            width: '68px',           // narrow

        },
        {
            name: 'Mã MH',
            selector: r => r.mamh,
            width: '135px',
        },
        {
            name: 'Tên MH',
            selector: r => r.tenmh

        },
        {
            name: 'Tên nhóm',
            selector: r => r.tennhom,
            width: '110px',
        },
        {
            name: 'Số TC',
            selector: r => r.sotinchi,
            width: '80px',          // narrow

        },
        {
            name: 'Giảng viên',
            selector: r => r.tengv,
            width: '225px',
        },

        {
            name: 'Phòng',
            selector: r => `${r.tenphong} – Khu ${r.khu}`,
            wrap: true,
            width: '150px',
        },
        {
            name: 'Thời gian',
            selector: r => {
                const thu = `Thứ ${r.thu}`;
                const tiet = `${r.tietbd}–${r.tietkt}`;
                const from = new Date(r.ngaybd).toLocaleDateString('vi-VN');
                const to = new Date(r.ngaykt).toLocaleDateString('vi-VN');
                return `${thu}, tiết ${tiet}\n,${from} → ${to}`;
            },
            wrap: true
        },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon btn-icon-edit" onClick={() => navigate(`/admin/lichhoc/edit/${r.id}`)}><FontAwesomeIcon icon={faEdit} /></button>
                    <button className="btn-icon btn-icon-delete" onClick={async () => {
                        if (window.confirm('Xóa?')) {
                            await deleteSchedule(r.id);
                            fetch();
                        }
                    }}> <FontAwesomeIcon icon={faTrash} /></button>
                </div>
            ),
            ignoreRowClick: true,
            width: '109px',
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Lịch học</h1>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
                type="text"
                placeholder="Tìm theo mã MH, tên MH, tên nhóm, giảng viên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    marginLeft: '8px',
                    marginBottom: '12px',
                    padding: '10px',
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                }}
            />
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button onClick={() => navigate('/admin/lichhoc/add')} className='btn-add'>
                    Thêm Lịch học
                </button>
            </div>

            <DataTable
                columns={columns}
                data={filteredSchedules}
                pagination
                persistTableHead
                progressPending={loading}
                customStyles={customStyles}
            />
        </div>
    );
}
