import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDotDK, deleteDotDK } from '../../../api/dotdangkyApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function DotDKManager() {
    const navigate = useNavigate();
    const { dotdk, setDotDK } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetch = async () => {
        setLoading(true);
        const res = await getDotDK();
        setDotDK(res.data);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const filtered = (dotdk || []).filter(d =>
        d.mahk.includes(search) ||
        new Date(d.ngaybd_dk).toLocaleString().includes(search) ||
        new Date(d.ngaykt_dk).toLocaleString().includes(search)
    );

    const columns = [
        { name: 'ID', selector: r => r.id, sortable: true, width: '60px' },
        { name: 'Mã Học kì', selector: r => r.mahk },
        { name: 'Ngày bắt đầu ĐK', selector: r => new Date(r.ngaybd_dk).toLocaleString() },
        { name: 'Ngày kết thúc ĐK', selector: r => new Date(r.ngaykt_dk).toLocaleString() },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => navigate(`/admin/dotdangky/edit/${r.id}`)} className='btn-edit'>Sửa</button>
                    <button onClick={async () => {
                        if (window.confirm('Xóa?')) { await deleteDotDK(r.id); fetch(); }
                    }} className='btn-delete'>Xóa</button>
                </div>
            ), ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Đợt đăng ký</h1>
            <div style={{ marginBottom: 16 }}>
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    placeholder="Tìm mã HK hoặc ngày…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 10, width: 300, marginLeft: 8, fontSize: 14 }}
                />
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <button onClick={() => navigate('/admin/dotdangky/add')} style={{ marginLeft: 8 }} className='btn-add'>Thêm đợt</button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filtered}
                pagination
                progressPending={loading}
            />
        </div>
    );
}
