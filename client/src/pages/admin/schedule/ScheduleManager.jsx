import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSchedules, deleteSchedule } from '../../../api/scheduleApi';
import { getAllSemesters } from '../../../api/utilsApi';
import { getGroups } from '../../../api/groupApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function ScheduleManagerTanStack() {
    const navigate = useNavigate();
    const { schedules, setSchedules } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');
    const [filterHocKy, setFilterHocKy] = useState('');
    const [filterNamHoc, setFilterNamHoc] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {

                const [sRes, gRes] = await Promise.all([getAllSemesters(), getGroups()]);
                setSemesters(sRes.data);
                setGroups(gRes.data);
                await fetchSchedules();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    const groupMap = useMemo(
        () => Object.fromEntries(groups.map(g => [g.manhom, g])),
        [groups]
    );
    const fetchSchedules = async () => {
        setLoading(true);
        const res = await getSchedules();
        setSchedules(res.data);
        setLoading(false);
    };

    const semesterMap = useMemo(
        () => Object.fromEntries(semesters.map(s => [s.mahk, s])),
        [semesters]
    );

    const aggregated = useMemo(
        () =>
            Object.values(
                schedules.reduce((acc, s) => {
                    if (!acc[s.manhom]) acc[s.manhom] = { ...s, sessions: [] };
                    acc[s.manhom].sessions.push(s);
                    return acc;
                }, {})
            ).map(g => {
                const grp = groupMap[g.sessions[0]?.manhom] || {};
                const sem = semesterMap[grp.mahk] || {};
                return {
                    ...g,
                    tenhk: sem.tenhk,
                    namhoc: sem.namhoc
                };
            }),
        [schedules, semesterMap]
    );

    const filtered = useMemo(
        () =>
            aggregated.filter(g => {
                const txt = search.toLowerCase();
                const matchBasic =
                    g.manhom.toLowerCase().includes(txt) ||
                    g.tenmh.toLowerCase().includes(txt) ||
                    g.tennhom.toLowerCase().includes(txt);
                const matchKhoa = !filterKhoa || g.khoa === filterKhoa;
                const matchHocKy = !filterHocKy || g.tenhk === filterHocKy;
                const matchNamHoc = !filterNamHoc || g.namhoc === filterNamHoc;
                return matchBasic && matchKhoa && matchHocKy && matchNamHoc;
            }),
        [aggregated, search, filterKhoa, filterHocKy, filterNamHoc]
    );

    const data = useMemo(
        () =>
            filtered.map(g => ({
                id: g.sessions[0]?.id,
                manhom: g.manhom,
                mamh: g.mamh,
                tenmh: g.tenmh,
                tennhom: g.tennhom,
                khoa: g.khoa,
                sotinchi: g.sotinchi,
                sessions: g.sessions,
                tenhk: g.tenhk,
                namhoc: g.namhoc,
                hocKy: g.tenhk && g.namhoc ? `${g.tenhk} – ${g.namhoc}` : 'Chưa xác định'
            })),
        [filtered]
    );

    const columns = useMemo(
        () => [
            { id: 'manhom', header: 'Mã nhóm', accessorKey: 'manhom' },
            { id: 'mamh', header: 'Mã MH', accessorKey: 'mamh' },
            { id: 'tenmh', header: 'Môn học', accessorKey: 'tenmh' },
            { id: 'tennhom', header: 'Tên nhóm', accessorKey: 'tennhom' },
            { id: 'sotinchi', header: 'Số TC', accessorKey: 'sotinchi' },
            { id: 'khoa', header: 'Khoa', accessorKey: 'khoa' },
            {
                id: 'hocKy',
                header: 'Học kỳ',
                accessorFn: row => row.hocKy,
                cell: info => info.getValue()
            },
            {
                id: 'schedule',
                header: 'Thời khóa biểu',
                accessorFn: row =>
                    row.sessions
                        .map(s => {
                            const thu = `Thứ ${s.thu === 8 ? 'CN' : s.thu}`;
                            const time = `${s.tietbd}-${s.tietkt}`;
                            const from = new Date(s.ngaybd).toLocaleDateString('vi-VN');
                            const to = new Date(s.ngaykt).toLocaleDateString('vi-VN');
                            return `${thu}, tiết ${time}\n${from} → ${to}\nPhòng: ${s.tenphong}–Khu ${s.khu}\nGV: ${s.tengv}`;
                        })
                        .join('\n\n'),
                cell: info => (
                    <pre style={{ margin: 0, fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                        {info.getValue()}
                    </pre>
                )
            },
            {
                id: 'actions',
                header: 'Hành động',
                cell: ({ row }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => navigate(`/admin/lichhoc/edit/${row.original.id}`)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                            className="btn-icon btn-icon-delete"
                            onClick={async () => {
                                if (window.confirm('Xóa nhóm này?')) {
                                    await Promise.all(row.original.sessions.map(s => deleteSchedule(s.id)));
                                    fetchSchedules();
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                )
            }
        ], [navigate]
    );

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
    const hocKyOptions = useMemo(
        () => Array.from(new Set(semesters.map(s => s.tenhk))).sort(),
        [semesters]
    );
    const namHocOptions = useMemo(
        () => Array.from(new Set(semesters.map(s => s.namhoc))).sort(),
        [semesters]
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
                    style={{ padding: 8, width: 200, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 8, borderRadius: 4 }}
                >
                    <option value="">-- Tất cả khoa --</option>
                    {khoaOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
                <select
                    value={filterHocKy}
                    onChange={e => setFilterHocKy(e.target.value)}
                    style={{ padding: 8, borderRadius: 4 }}
                >
                    <option value="">-- Tất cả học kỳ --</option>
                    {hocKyOptions.map(hk => (
                        <option key={hk} value={hk}>{hk}</option>
                    ))}
                </select>
                <select
                    value={filterNamHoc}
                    onChange={e => setFilterNamHoc(e.target.value)}
                    style={{ padding: 8, borderRadius: 4 }}
                >
                    <option value="">-- Tất cả năm học --</option>
                    {namHocOptions.map(nh => (
                        <option key={nh} value={nh}>{nh}</option>
                    ))}
                </select>
                <button
                    onClick={() => navigate('/admin/lichhoc/add')}
                    className="btn-add"
                    style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 4 }}
                >
                    Thêm Lịch học
                </button>
            </div>

            <table className="tanstack-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    style={{ border: '1px solid #ccc', padding: 8, backgroundColor: '#f1f1f1' }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: 8,
                                        verticalAlign: 'top',
                                        whiteSpace: cell.column.id === 'schedule' ? 'pre-wrap' : 'normal'
                                    }}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell ?? cell.column.columnDef.accessorFn ??
                                        cell.column.columnDef.accessorKey,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

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
