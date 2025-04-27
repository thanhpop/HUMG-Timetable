// src/pages/admin/room/RoomManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { getRooms, deleteRoom } from '../../../api/roomApi';
import '../style.css';

export default function RoomManager() {
    const navigate = useNavigate();
    const { rooms, setRooms } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetch = async () => {
        setLoading(true);
        const res = await getRooms();
        setRooms(res.data);
        setLoading(false);
    };
    const handleSearch = e => setSearchTerm(e.target.value);

    useEffect(() => { fetch(); }, []);

    const filtered = rooms.filter(r => {
        const code = r.maphong.toString();
        return (
            code.includes(searchTerm) ||
            r.tenphong.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
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

    const columns = [
        { name: 'Mã phòng', selector: r => r.maphong, sortable: true },
        { name: 'Tên phòng', selector: r => r.tenphong, sortable: true },
        { name: 'Khu', selector: r => r.khu },
        { name: 'Sức chứa', selector: r => r.soluong },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>

                    <button onClick={() => navigate(`/admin/rooms/edit/${r.maphong}`)} style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Sửa</button>
                    <button onClick={async () => { await deleteRoom(r.maphong); fetch(); }} style={{ width: 50, padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}>Xóa</button>
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
                    type="text"
                    placeholder="Tìm mã hoặc tên phòng"
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ padding: 10, width: 280, fontSize: 16 }}
                />
            </div>
            <div style={{ marginBottom: 16, textAlign: 'right', }}>
                <button onClick={() => navigate('/admin/rooms/add')} style={{
                    padding: '15px 20px',
                    backgroundColor: '#0c4ca3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 'bold',
                }}>Thêm Phòng học</button>
            </div>
            <DataTable
                columns={columns}
                data={filtered}
                pagination

                progressPending={loading}
                customStyles={customStyles}
            />
        </div>
    );
}
