import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getDotDK, deleteDotDK } from '../../../api/dotdangkyApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

// Hàm định dạng ngày từ chuỗi ISO sang "dd/mm/yyyy"
function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

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
        d.mahk.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { name: 'ID', selector: r => r.id, sortable: true, width: '60px' },
        { name: 'Mã học kì', selector: r => r.mahk },
        { name: 'Ngày bắt đầu đăng ký', selector: r => formatDate(r.ngaybd_dk) },
        { name: 'Ngày kết thúc đăng ký', selector: r => formatDate(r.ngaykt_dk) },
        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => navigate(`/admin/dotdangky/edit/${r.id}`)} className='btn-edit'>Sửa</button>
                    <button onClick={async () => {
                        if (window.confirm('Xóa?')) {
                            await deleteDotDK(r.id);
                            fetch();
                        }
                    }} className='btn-delete'>Xóa</button>
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Đợt đăng ký</h1>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faSearch} />
                <input
                    placeholder="Tìm mã HK…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 6, width: 250 }}
                />
                <button onClick={() => navigate('/admin/dotdangky/add')} className='btn-add' style={{ marginLeft: 'auto' }}>
                    Thêm đợt
                </button>
            </div>
            <DataTable
                columns={columns}
                data={filtered}
                pagination
                progressPending={loading}
                persistTableHead
            />
        </div>
    );
}
