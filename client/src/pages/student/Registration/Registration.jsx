// src/pages/student/Registration/RegistrationTanStack.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender
} from '@tanstack/react-table';
import { getSchedules } from '../../../api/scheduleApi';
import {
    getMyRegistrations,
    createRegistration,
    deleteRegistration
} from '../../../api/dangkyApi';
import { getCountByLichHoc } from '../../../api/dangkyApi';
import { getCurrentMsv } from '../../utils/auth';
import './style.css';

export default function RegistrationTanStack() {
    const [openClasses, setOpenClasses] = useState([]);
    const [myRegs, setMyRegs] = useState([]);
    const [loadingOpen, setLoadingOpen] = useState(false);
    const [loadingMy, setLoadingMy] = useState(false);
    const [searchOpen, setSearchOpen] = useState('');
    const [searchMy, setSearchMy] = useState('');
    const [dangKyCount, setDangKyCount] = useState({});



    const msv = getCurrentMsv();
    if (!msv) return <div>Vui lòng đăng nhập để xem đăng ký.</div>;

    useEffect(() => {
        (async () => {
            setLoadingOpen(true);
            const res1 = await getSchedules();
            setOpenClasses(res1.data);
            setLoadingOpen(false);

            setLoadingMy(true);
            const res2 = await getMyRegistrations();
            setMyRegs(res2.data);
            setLoadingMy(false);
            const countRes = await getCountByLichHoc();
            // chuyển mảng → map { lichhoc_id: count }
            const map = countRes.data.reduce((acc, { lichhoc_id, count }) => {
                acc[lichhoc_id] = count;
                return acc;
            }, {});
            setDangKyCount(map);
        })();
    }, []);

    // map từ lichhoc_id → registration id
    const regMap = useMemo(
        () => myRegs.reduce((acc, r) => { acc[r.lichhoc_id] = r.id; return acc; }, {}),
        [myRegs]
    );
    const registeredIds = useMemo(() => new Set(myRegs.map(r => r.lichhoc_id)), [myRegs]);
    const refreshDangKyCount = async () => {
        const countRes = await getCountByLichHoc();
        const map = countRes.data.reduce((acc, { lichhoc_id, count }) => {
            acc[lichhoc_id] = count;
            return acc;
        }, {});
        setDangKyCount(map);
    };
    const handleToggleGroup = async sessionIds => {
        const allRegistered = sessionIds.every(id => registeredIds.has(id));
        if (allRegistered) {
            if (window.confirm('Bạn có chắc muốn hủy đăng ký?')) {
                const regIds = sessionIds.map(id => regMap[id]).filter(Boolean);
                await Promise.all(regIds.map(rid => deleteRegistration(rid)));
                setMyRegs(prev => prev.filter(r => !sessionIds.includes(r.lichhoc_id)));
            }
        } else {
            for (const id of sessionIds) {
                if (!registeredIds.has(id)) {
                    await createRegistration({ msv, lichhoc_id: id });
                }
            }
            const res = await getMyRegistrations();
            setMyRegs(res.data);
        }
        await refreshDangKyCount();
    };

    // --- OPEN CLASSES TABLE ---
    const dataOpen = useMemo(() => {
        const grouped = Object.values(
            openClasses.reduce((acc, s) => {
                if (!acc[s.manhom]) acc[s.manhom] = { ...s, sessions: [] };
                acc[s.manhom].sessions.push(s);
                return acc;
            }, {})
        );
        return grouped
            .filter(g => [g.mamh, g.tenmh, g.tennhom]
                .join(' ')
                .toLowerCase()
                .includes(searchOpen.toLowerCase())
            )
            .map(g => ({
                mamh: g.mamh,
                tenmh: g.tenmh,
                sotinchi: g.sotinchi,
                tennhom: g.tennhom,
                // tính tổng sức chứa
                soluong: Math.min(...g.sessions.map(s => s.succhua || 0)),
                // tính tổng còn lại
                conlai: Math.min(...g.sessions.map(s => {
                    const cap = s.succhua || 0;
                    const used = dangKyCount[s.id] || 0;
                    return cap - used;
                })),
                sessions: g.sessions
            }));
    }, [openClasses, searchOpen, myRegs, dangKyCount]);

    const columnsOpen = useMemo(() => [
        { id: 'mamh', header: 'Mã MH', accessorKey: 'mamh' },
        { id: 'tenmh', header: 'Tên MH', accessorKey: 'tenmh' },
        { id: 'sotinchi', header: 'Số TC', accessorKey: 'sotinchi' },
        { id: 'tennhom', header: 'Nhóm', accessorKey: 'tennhom' },
        { id: 'soluong', header: 'Số lượng', accessorKey: 'soluong' },
        { id: 'conlai', header: 'Còn lại', accessorKey: 'conlai' },
        {
            id: 'schedule', header: 'Thời gian', accessorFn: row =>
                row.sessions.map(s => {
                    const thu = `Thứ ${s.thu === 8 ? 'CN' : s.thu}`;
                    const from = new Date(s.ngaybd).toLocaleDateString('vi-VN');
                    const to = new Date(s.ngaykt).toLocaleDateString('vi-VN');
                    return `${thu}, ${from} → ${to}\nGV: ${s.tengv}, Phòng: ${s.tenphong}–Khu ${s.khu}`;
                }).join('\n\n'),
            cell: info => <pre style={{ margin: 0, fontSize: '16px' }}>{info.getValue()}</pre>
        },
        {
            id: 'register', header: 'Đăng ký', cell: ({ row }) => {
                const ids = row.original.sessions.map(s => s.id);
                const allReg = ids.every(id => registeredIds.has(id));
                const style = allReg
                    ? { padding: '4px 8px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
                    : { padding: '4px 8px' };
                return <button style={style} onClick={() => handleToggleGroup(ids)}>
                    {allReg ? 'Hủy đăng ký' : 'Đăng ký'}
                </button>;
            }
        }
    ], [registeredIds, handleToggleGroup]);

    const tableOpen = useReactTable({
        data: dataOpen,
        columns: columnsOpen,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageIndex: 0, pageSize: 5 } }
    });

    // --- MY REGISTRATIONS TABLE (không pagination) ---
    const dataMy = useMemo(() => {
        const grouped = Object.values(
            myRegs.reduce((acc, r) => {
                const key = `${r.mamh}-${r.tennhom}`;
                if (!acc[key]) acc[key] = { ...r, sessions: [] };
                acc[key].sessions.push(r);
                return acc;
            }, {})
        );
        return grouped
            .filter(g => [g.mamh, g.tenmh, g.tennhom]
                .join(' ')
                .toLowerCase()
                .includes(searchMy.toLowerCase())
            )
            .map(g => ({
                mamh: g.mamh,
                tenmh: g.tenmh,
                sotinchi: g.sotinchi,
                tennhom: g.tennhom,
                ngaydk: g.sessions[0].ngaydk,
                sessionIds: g.sessions.map(s => s.lichhoc_id)
            }));
    }, [myRegs, searchMy]);
    const totalRegistered = dataMy.length;
    const totalCredits = dataMy.reduce((sum, r) => sum + (r.sotinchi || 0), 0);
    const columnsMy = useMemo(() => [
        { id: 'mamh', header: 'Mã MH', accessorKey: 'mamh' },
        { id: 'tenmh', header: 'Tên MH', accessorKey: 'tenmh' },
        { id: 'sotinchi', header: 'Số TC', accessorKey: 'sotinchi' },
        { id: 'tennhom', header: 'Nhóm', accessorKey: 'tennhom' },
        { id: 'ngaydk', header: 'Ngày đăng ký', accessorFn: row => new Date(row.ngaydk).toLocaleString() },
        {
            id: 'unreg', header: 'Hủy', cell: ({ row }) => {
                const ids = row.original.sessionIds;
                return <button
                    style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => handleToggleGroup(ids)}
                >xóa</button>;
            }
        }
    ], [myRegs, handleToggleGroup]);

    const tableMy = useReactTable({
        data: dataMy,
        columns: columnsMy,
        getCoreRowModel: getCoreRowModel(),
        // bỏ pagination:
        initialState: { pagination: { pageIndex: 0, pageSize: dataMy.length || 1 } }
    });


    const renderTable = table => (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
            <thead>
                {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                        {hg.headers.map(h => (
                            <th key={h.id} style={{ border: '1px solid #ccc', padding: 8, backgroundColor: '#f1f1f1' }}>
                                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} style={{ border: '1px solid #ccc', padding: 8, verticalAlign: 'top' }}>
                                {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorFn ?? cell.column.columnDef.accessorKey, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderPagination = table => (
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
            <span>Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
            <select value={table.getState().pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))}>
                {[10, 20, 50].map(sz => <option key={sz} value={sz}>Show {sz}</option>)}
            </select>
        </div>
    );

    return (
        <div className="registration-page">
            <div className="registration-header"><h1>Đăng ký môn học học kỳ 2 – Năm học 2024–2025</h1></div>
            <section style={{ paddingBottom: 24 }}>
                <h2>Danh sách môn học mở cho đăng ký</h2>
                <input className="search" placeholder="Tìm mã/Tên MH…" value={searchOpen} onChange={e => setSearchOpen(e.target.value)} />
                {loadingOpen ? <div>Loading…</div> : renderTable(tableOpen)}
                {renderPagination(tableOpen)}
            </section>
            <section style={{ paddingBottom: 24 }}>
                <h2>Danh sách môn học đã đăng ký</h2>

                <input className="search" placeholder="Tìm mã/Tên MH…" value={searchMy} onChange={e => setSearchMy(e.target.value)} />
                {loadingMy ? <div>Loading…</div> : renderTable(tableMy)}
                <div style={{ margin: '8px 0', fontWeight: 'bold' }}>
                    Số môn đã đăng ký: {totalRegistered} | Tổng tín chỉ: {totalCredits}
                </div>
            </section>
        </div>
    );
}
