import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSchedules, deleteSchedule } from '../../../api/scheduleApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function ScheduleManagerTanStack() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        const res = await getSchedules();
        setSchedules(res.data);
        setLoading(false);
    };

    // 1. Aggregate by group
    const aggregated = useMemo(
        () =>
            Object.values(
                schedules.reduce((acc, s) => {
                    if (!acc[s.manhom]) acc[s.manhom] = { ...s, sessions: [] };
                    acc[s.manhom].sessions.push(s);
                    return acc;
                }, {})
            ),
        [schedules]
    );

    // 2. Filter groups
    const filtered = useMemo(
        () =>
            aggregated.filter(g => {
                const txt = search.toLowerCase();
                const matchBasic =
                    g.manhom.toLowerCase().includes(txt) ||
                    g.tenmh.toLowerCase().includes(txt) ||
                    g.tennhom.toLowerCase().includes(txt);
                const matchKhoa = !filterKhoa || g.khoa === filterKhoa;
                return matchBasic && matchKhoa;
            }),
        [aggregated, search, filterKhoa]
    );

    // 3. Flatten into rows
    const data = useMemo(
        () =>
            filtered.flatMap(g =>
                g.sessions.map((s, idx) => ({
                    manhom: g.manhom,
                    mamh: g.mamh,
                    tenmh: g.tenmh,
                    tennhom: g.tennhom,
                    khoa: g.khoa,
                    sotinchi: g.sotinchi,
                    thu: s.thu,
                    tietbd: s.tietbd,
                    tietkt: s.tietkt,
                    ngaybd: s.ngaybd,
                    ngaykt: s.ngaykt,
                    tenphong: s.tenphong,
                    khu: s.khu,
                    tengv: s.tengv,
                    sessionId: s.id,
                    isFirst: idx === 0,
                    rowspan: g.sessions.length
                }))
            ),
        [filtered]
    );

    // 4. Column definitions
    const columns = useMemo(
        () => [
            { id: 'manhom', header: 'Mã nhóm', accessorKey: 'manhom' },
            { id: 'mamh', header: 'Mã MH', accessorKey: 'mamh' },
            { id: 'tenmh', header: 'Môn học', accessorKey: 'tenmh' },

            { id: 'tennhom', header: 'Tên nhóm', accessorKey: 'tennhom' },
            { id: 'khoa', header: 'Khoa', accessorKey: 'khoa' },
            { id: 'sotinchi', header: 'Số TC', accessorKey: 'sotinchi' },
            {
                id: 'schedule', header: 'Thời khóa biểu', accessorFn: row => {
                    const thu = `Thứ ${row.thu === 8 ? 'CN' : row.thu}`;
                    const tiet = `${row.tietbd}-${row.tietkt}`;
                    const from = new Date(row.ngaybd).toLocaleDateString('vi-VN');
                    const to = new Date(row.ngaykt).toLocaleDateString('vi-VN');
                    return `${thu}, tiết ${tiet}\n${from} → ${to}\n${row.tenphong} – Khu ${row.khu}\nGV: ${row.tengv}`;
                }
            },
            {
                id: 'actions', header: 'Hành động', cell: ({ row }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="btn-icon btn-icon-edit" onClick={() => navigate(`/admin/lichhoc/edit/${row.original.sessionId}`)}>
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="btn-icon btn-icon-delete" onClick={async () => {
                            if (window.confirm('Xóa nhóm này?')) {
                                await Promise.all(
                                    data.filter(r => r.manhom === row.original.manhom)
                                        .map(r => deleteSchedule(r.sessionId))
                                );
                                fetchSchedules();
                            }
                        }}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                )
            }
        ],
        [navigate, data]
    );

    // Initialize table with pagination
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageIndex: 0, pageSize: 10 } }
    });

    const khoaOptions = useMemo(
        () => Array.from(new Set(aggregated.map(g => g.khoa))).sort(),
        [aggregated]
    );

    return (
        <div style={{ padding: 20 }}>
            <h1>Quản lý Lịch học</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FontAwesomeIcon icon={faSearch} />
                <input
                    type="text"
                    placeholder="Tìm nhóm, môn, tên nhóm…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 8, width: 250, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 8, borderRadius: 4 }}
                >
                    <option value="">-- Tất cả khoa --</option>
                    {khoaOptions.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <button onClick={() => navigate('/admin/lichhoc/add')} className="btn-add" style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 4 }}>
                    Thêm Lịch học
                </button>
            </div>

            {/* Table with borders */}
            <table className="tanstack-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={{ border: '1px solid #ccc', padding: 8, backgroundColor: '#f1f1f1' }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => {
                                const colId = cell.column.id;
                                const orig = row.original;
                                const isGroupCol = ['manhom', 'mamh', 'tenmh', 'tennhom', 'khoa', 'sotinchi', 'actions'].includes(colId);
                                if (isGroupCol && !orig.isFirst) return null;
                                const rowSpan = isGroupCol && orig.isFirst ? orig.rowspan : undefined;
                                return (
                                    <td key={cell.id}
                                        rowSpan={rowSpan}
                                        style={{
                                            border: '1px solid #ccc',
                                            padding: 8,
                                            verticalAlign: 'top',
                                            whiteSpace: cell.column.id === 'schedule' ? 'pre-wrap' : 'normal'
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-pagination">
                    Previous
                </button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-pagination">
                    Next
                </button>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    style={{ marginLeft: 'auto', padding: 4 }}
                >
                    {[5, 10, 20, 50].map(size => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}