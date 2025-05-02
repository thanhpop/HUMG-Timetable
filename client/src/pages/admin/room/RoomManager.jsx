// src/pages/admin/room/RoomManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { getRooms, deleteRoom } from '../../../api/roomApi';
import '../style.css';

export default function RoomManager() {
    const nav = useNavigate();
    const { rooms, setRooms } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');

    const fetch = async () => {
        setLoading(true);
        const res = await getRooms();
        setRooms(res.data);
        setLoading(false);
    };
    useEffect(() => { fetch() }, []);

    const filtered = rooms.filter(r =>
        r.maphong.includes(q) ||
        r.tenphong.toLowerCase().includes(q.toLowerCase())
    );
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
        { name: 'Mã phòng', selector: r => r.maphong, sortable: true },
        { name: 'Tên phòng', selector: r => r.tenphong, sortable: true },
        { name: 'Khu', selector: r => r.khu },
        { name: 'Sức chứa', selector: r => r.succhua },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => nav(`/admin/rooms/edit/${r.maphong}`)} className="btn-edit">Sửa</button>
                    <button onClick={async () => {
                        if (window.confirm('Xóa phòng?')) {
                            await deleteRoom(r.maphong);
                            fetch();
                        }
                    }} className="btn-delete">Xóa</button>
                </div>
            ), ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Phòng học</h1>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    placeholder="Tìm mã hoặc tên"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ padding: 10, width: 280, fontSize: 16 }}
                />
            </div><div style={{ marginBottom: 16, textAlign: 'right', }}>
                <button onClick={() => nav('/admin/rooms/add')} className="btn-add">Thêm Phòng</button> </div>
            <DataTable
                columns={columns}
                data={filtered}
                pagination
                progressPending={loading}
                persistTableHead={true}
                customStyles={customStyles}
            />
        </div>
    );
}
