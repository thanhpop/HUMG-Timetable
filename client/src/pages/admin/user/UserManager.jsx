// src/pages/admin/user/UserManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getUsers, deleteUser } from '../../../api/userApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function UserManager() {
    const nav = useNavigate();
    const { users, setUsers } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // fetch danh sách user
    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await getUsers();
            setUsers(res.data);
            setLoading(false);
        })();
    }, []);

    // filter theo username hoặc vai trò
    const filtered = (users || []).filter(u =>
        u.username.includes(search) ||
        u.vaitro.includes(search)
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
                borderRight: '1px solid #e0e0e0',
            },
        },
    };

    const columns = [
        { name: 'ID', selector: r => r.id, sortable: true },
        { name: 'Username', selector: r => r.username, sortable: true },
        { name: 'Vai trò', selector: r => r.vaitro },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => nav(`/admin/users/edit/${r.id}`)} className="btn-edit">Sửa</button>
                    {r.vaitro !== 'admin' ? (
                        <button
                            onClick={async () => {
                                if (window.confirm('Xóa user này?')) {
                                    await deleteUser(r.id);
                                    const res = await getUsers();
                                    setUsers(res.data);
                                }
                            }}
                            className="btn-delete"
                        >
                            Xóa
                        </button>
                    ) : (
                        <button
                            disabled
                            title="Không thể xóa tài khoản admin"
                            style={{
                                width: 50,
                                padding: '6px',
                                backgroundColor: '#ccc',
                                color: '#666',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'not-allowed'
                            }}
                        >
                            Xóa
                        </button>
                    )}
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý tài khoản</h1>
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    placeholder="Tìm username hoặc vai trò…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 10, fontSize: 14, width: 280 }}
                />


            </div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button onClick={() => nav('/admin/users/add')} className="btn-add">
                    Thêm User
                </button>

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
