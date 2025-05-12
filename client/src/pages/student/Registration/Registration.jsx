import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

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
    const [dangKyCount, setDangKyCount] = useState({});
    const [filterKhoa, setFilterKhoa] = useState('');



    const msv = getCurrentMsv();
    if (!msv) return <div>Vui lòng đăng nhập để xem đăng ký.</div>;


    const tietThoiGian = {
        1: { start: "06:45", end: "07:35" },
        2: { start: "07:45", end: "08:35" },
        3: { start: "08:45", end: "09:35" },
        4: { start: "09:45", end: "10:35" },
        5: { start: "10:45", end: "11:35" },
        6: { start: "12:30", end: "13:20" },
        7: { start: "13:30", end: "14:20" },
        8: { start: "14:30", end: "15:20" },
        9: { start: "15:30", end: "16:20" },
        10: { start: "16:30", end: "17:20" },
        11: { start: "17:30", end: "18:20" },
        12: { start: "18:30", end: "19:20" },
        13: { start: "19:30", end: "20:20" }
    };

    function getTimeFromTiet(tietbd, tietkt) {
        const start = tietThoiGian[tietbd]?.start || "??:??";
        const end = tietThoiGian[tietkt]?.end || "??:??";
        return `${start} – ${end}`;
    }
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
            const map = countRes.data.reduce((acc, { lichhoc_id, count }) => {
                acc[lichhoc_id] = count;
                return acc;
            }, {});
            setDangKyCount(map);
        })();
    }, []);

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
    function isConflict(session1, session2) {
        // Cùng thứ
        if (session1.thu !== session2.thu) return false;

        // Khoảng ngày học giao nhau
        const bd1 = new Date(session1.ngaybd);
        const kt1 = new Date(session1.ngaykt);
        const bd2 = new Date(session2.ngaybd);
        const kt2 = new Date(session2.ngaykt);
        const dateOverlap = !(kt1 < bd2 || kt2 < bd1);
        if (!dateOverlap) return false;

        // Giao tiết học
        const start1 = session1.tietbd;
        const end1 = session1.tietkt;
        const start2 = session2.tietbd;
        const end2 = session2.tietkt;
        const tietOverlap = !(end1 < start2 || end2 < start1);

        return tietOverlap;
    }

    const handleToggleGroup = async sessionIds => {
        await refreshDangKyCount();

        const sessionObjs = openClasses.filter(s => sessionIds.includes(s.id));
        for (const s of sessionObjs) {
            const used = dangKyCount[s.id] || 0;
            const available = (s.succhua || 0) - used;

            if (!registeredIds.has(s.id) && available <= 0) {
                alert(`Môn: ${s.tenmh} (${s.mamh}) nhóm ${s.tennhom} đã hết chỗ!`);
                return;
            }

            // Kiểm tra xung đột lịch học
            const conflict = myRegs.some(r =>
                isConflict(s, r)
            );

            if (!registeredIds.has(s.id) && conflict) {
                alert(`Môn: ${s.tenmh} (${s.mamh}) nhóm ${s.tennhom} bị trùng lịch với môn đã đăng ký!`);
                return;
            }
        }

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

    // --- OPEN CLASSES ---
    const dataOpen = useMemo(() => {
        const grouped = Object.values(
            openClasses.reduce((acc, s) => {
                if (!acc[s.manhom]) acc[s.manhom] = { ...s, sessions: [] };
                acc[s.manhom].sessions.push(s);
                return acc;
            }, {})
        );
        return grouped
            .filter(g => {
                const matchText = [g.mamh, g.tenmh, g.tennhom]
                    .join(' ').toLowerCase()
                    .includes(searchOpen.toLowerCase());
                const matchKhoa = filterKhoa === '' || (g.khoa && g.khoa.toLowerCase() === filterKhoa.toLowerCase());
                return matchText && matchKhoa;
            })
            .map(g => ({
                mamh: g.mamh,
                tenmh: g.tenmh,
                sotinchi: g.sotinchi,
                tennhom: g.tennhom,
                tenkhoa: g.khoa,
                soluong: Math.min(...g.sessions.map(s => s.succhua || 0)),
                conlai: Math.min(...g.sessions.map(s => {
                    const cap = s.succhua || 0;
                    const used = dangKyCount[s.id] || 0;
                    return cap - used;
                })),
                sessions: g.sessions
            }));
    }, [openClasses, searchOpen, dangKyCount, filterKhoa]);

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
                    const time = getTimeFromTiet(s.tietbd, s.tietkt);
                    const from = new Date(s.ngaybd).toLocaleDateString('vi-VN');
                    const to = new Date(s.ngaykt).toLocaleDateString('vi-VN');
                    return `${thu}, ${time}, ${from} → ${to}\nGV: ${s.tengv}, Phòng: ${s.tenphong}–Khu ${s.khu}`;
                }).join('\n\n'),
            cell: info => <pre style={{ margin: 0, fontSize: '16px' }}>{info.getValue()}</pre>
        },
        {
            id: 'register', header: 'Đăng ký', size: 120,
            cell: ({ row }) => {
                const { conlai, sessions } = row.original;
                const ids = sessions.map(s => s.id);
                const allReg = ids.every(id => registeredIds.has(id));
                const isFull = conlai <= 0 && !allReg;
                const baseStyle = {
                    padding: '8px 16px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: 6,
                    margin: '0 auto',
                    display: 'block',
                    width: '100px'
                };
                const style = {
                    ...baseStyle,
                    backgroundColor: allReg ? '#e74c3c' : '#3498db',
                    color: '#fff',
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    opacity: isFull ? 0.6 : 1
                };
                return (
                    <button
                        disabled={isFull}
                        style={style}
                        onClick={() => !isFull && handleToggleGroup(ids)}
                    >
                        {allReg ? 'Hủy' : 'Đăng ký'}
                    </button>
                );
            }
        }
    ], [registeredIds, handleToggleGroup, dangKyCount]);

    const tableOpen = useReactTable({
        data: dataOpen,
        columns: columnsOpen,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageIndex: 0, pageSize: 5 } }
    });

    // --- MY REGISTRATIONS ---
    const dataMy = useMemo(() => {
        const grouped = Object.values(
            myRegs.reduce((acc, r) => {
                const key = `${r.mamh}-${r.tennhom}`;
                if (!acc[key]) acc[key] = { ...r, sessions: [] };
                acc[key].sessions.push(r);
                return acc;
            }, {})
        );
        return grouped.map(g => ({
            mamh: g.mamh,
            tenmh: g.tenmh,
            sotinchi: g.sotinchi,
            tennhom: g.tennhom,
            ngaydk: g.sessions[0].ngaydk,
            sessions: g.sessions,
            // sessionIds: g.sessions.map(s => s.lichhoc_id)
        }));
    }, [myRegs]);

    const totalRegistered = dataMy.length;
    const totalCredits = dataMy.reduce((sum, r) => sum + (r.sotinchi || 0), 0);

    const columnsMy = useMemo(() => [
        { id: 'mamh', header: 'Mã MH', accessorKey: 'mamh' },
        { id: 'tenmh', header: 'Tên MH', accessorKey: 'tenmh' },
        { id: 'sotinchi', header: 'Số TC', accessorKey: 'sotinchi' },
        { id: 'tennhom', header: 'Nhóm', accessorKey: 'tennhom' },
        {
            id: 'schedule',
            header: 'Thời gian',
            accessorFn: row =>
                row.sessions.map(s => {
                    const thu = `Thứ ${s.thu === 8 ? 'CN' : s.thu}`;
                    const time = getTimeFromTiet(s.tietbd, s.tietkt);
                    const from = new Date(s.ngaybd).toLocaleDateString('vi-VN');
                    const to = new Date(s.ngaykt).toLocaleDateString('vi-VN');
                    return `${thu}, ${time}, ${from} → ${to}\nGV: ${s.tengv}, Phòng: ${s.tenphong}–Khu ${s.khu}`;
                }).join('\n\n'),
            cell: info => (
                <pre style={{ margin: 0, fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                    {info.getValue()}
                </pre>
            )
        },
        { id: 'ngaydk', header: 'Ngày đăng ký', accessorFn: row => new Date(row.ngaydk).toLocaleString() },
        {
            id: 'unreg', header: 'Hủy', size: 120,
            cell: ({ row }) => (
                <button
                    style={{
                        padding: '8px 16px',
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: 6,
                        margin: '0 auto',
                        display: 'block',
                        width: '100px',
                        backgroundColor: '#e74c3c',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={() => handleToggleGroup(row.original.sessions.map(s => s.lichhoc_id))}
                >
                    Xóa
                </button>
            )
        }
    ], [handleToggleGroup]);

    const tableMy = useReactTable({
        data: dataMy,
        columns: columnsMy,
        getCoreRowModel: getCoreRowModel(),
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
        <div className="pagination" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 12 }}>
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
            <div className="registration-header"><h1>Đăng ký môn học</h1></div>
            <section style={{ paddingBottom: 24 }}>
                <h2>Danh sách môn học mở cho đăng ký</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }} />
                        <input
                            className="search"
                            placeholder="Tìm mã / tên môn học"
                            value={searchOpen}
                            onChange={e => setSearchOpen(e.target.value)}
                            style={{
                                fontSize: '18px',
                                padding: '7px 25px 7px 35px'
                            }}
                        />
                    </div>
                    <select value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)} style={{ fontSize: '16px', padding: '8px' }}>
                        <option value="">-- Tất cả khoa --</option>
                        {[...new Set(openClasses.map(c => c.khoa))].filter(k => k != null).map(khoa => (
                            <option key={khoa} value={khoa}>{khoa}</option>
                        ))}
                    </select>
                </div>
                {loadingOpen ? <div>Loading…</div> : renderTable(tableOpen)}
                {renderPagination(tableOpen)}
            </section>
            <section style={{ paddingBottom: 100 }}>
                <h2>Danh sách môn học đã đăng ký</h2>
                {loadingMy ? <div>Loading…</div> : renderTable(tableMy)}
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '15px 16px', fontWeight: 'bold', fontSize: '17px' }}>
                    Số môn đã đăng ký: {totalRegistered} | Tổng tín chỉ: {totalCredits}
                </div>
            </section>
        </div>
    );
}
