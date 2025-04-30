// src/pages/admin/schedule/ScheduleManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSchedules, deleteSchedule } from '../../../api/scheduleApi';
import '../style.css';

export default function ScheduleManager() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();
    const [loading, setLoading] = useState(false);

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
            center: true,
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
            width: '135px',
        },
        {
            name: 'Số TC',
            selector: r => r.sotinchi,
            width: '80px',          // narrow
            center: true,
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
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => navigate(`/admin/lichhoc/edit/${r.id}`)}>Sửa</button>
                    <button onClick={async () => {
                        if (window.confirm('Xóa?')) {
                            await deleteSchedule(r.id);
                            fetch();
                        }
                    }}>Xóa</button>
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Lịch học</h1>
            <button onClick={() => navigate('/admin/lichhoc/add')} style={{ marginBottom: 16 }}>
                Thêm Lịch học
            </button>
            <DataTable
                columns={columns}
                data={schedules}
                pagination
                persistTableHead
                progressPending={loading}
                customStyles={customStyles}
            />
        </div>
    );
}
