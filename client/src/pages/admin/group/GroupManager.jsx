import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getGroups, deleteGroup } from '../../../api/groupApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function GroupManager() {
    const nav = useNavigate();
    const { groups, setGroups } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetch = async () => {
        setLoading(true);
        const res = await getGroups();
        setGroups(res.data);
        setLoading(false);
    };
    useEffect(() => { fetch(); }, []);

    const filtered = groups.filter(g =>
        g.manhom.includes(search) ||
        g.tennhom.toLowerCase().includes(search.toLowerCase())
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
        { name: 'Mã nhóm', selector: r => r.manhom, sortable: true },
        { name: 'Tên nhóm', selector: r => r.tennhom, sortable: true },
        { name: 'Mã MH', selector: r => r.mamh },
        { name: 'Mã GV', selector: r => r.mgv },
        { name: 'Phòng', selector: r => r.maphong },
        { name: 'Số SV', selector: r => r.soluongsv },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => nav(`/admin/groups/view/${r.manhom}`)} style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Xem</button>
                    <button onClick={() => nav(`/admin/groups/edit/${r.manhom}`)} style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>Sửa</button>
                    <button onClick={async () => { await deleteGroup(r.manhom); fetch(); }} style={{ width: 50, padding: '6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
                        Xóa
                    </button>
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Nhóm môn học</h1>
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    placeholder="Tìm mã hoặc tên nhóm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 10, width: 280, fontSize: 16 }}
                />
            </div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button onClick={() => nav('/admin/groups/add')} style={{
                    padding: '15px 20px',
                    backgroundColor: '#0c4ca3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 'bold',
                }} >Thêm Nhóm</button>
            </div>
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
