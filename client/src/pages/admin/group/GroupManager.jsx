import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getGroups, deleteGroup } from '../../../api/groupApi';
import {
    getAllCourses,
    getAllTeachers,
    getAllRooms,
    getAllSemesters
} from '../../../api/utilsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function GroupManagerTanStack() {
    const navigate = useNavigate();
    const { groups, setGroups } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');
    const [filterHocKy, setFilterHocKy] = useState('');
    const [filterNamHoc, setFilterNamHoc] = useState('');
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const sRes = await getAllSemesters();
                const [gRes, cRes, tRes, rRes] = await Promise.all([
                    getGroups(),
                    getAllCourses(),
                    getAllTeachers(),
                ]);
                setGroups(gRes.data);
                setCourses(cRes.data);
                setTeachers(tRes.data);
                setSemesters(sRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const semesterMap = useMemo(
        () => Object.fromEntries(semesters.map(s => [s.mahk, s])),
        [semesters]
    );

    // Filtered & enriched data
    const data = useMemo(() => {
        return groups
            .filter(g => {
                const term = search.toLowerCase();
                const textMatch = g.manhom.toLowerCase().includes(term) || g.tennhom.toLowerCase().includes(term);

                // Course / department filter
                const course = courses.find(c => c.mamh === g.mamh);
                const khoa = course?.khoa ?? '';
                const khoaMatch = !filterKhoa || khoa === filterKhoa;

                // Semester filters
                const sem = semesterMap[g.mahk] || {};
                const hocKyMatch = !filterHocKy || sem.tenhk === filterHocKy;
                const namHocMatch = !filterNamHoc || sem.namhoc === filterNamHoc;

                return textMatch && khoaMatch && hocKyMatch && namHocMatch;
            })
            .map(g => {
                const course = courses.find(c => c.mamh === g.mamh) || {};
                const sem = semesterMap[g.mahk] || {};
                const teacher = teachers.find(t => t.mgv === g.mgv) || {};
                return {
                    id: g.manhom,
                    manhom: g.manhom,
                    tennhom: g.tennhom,
                    tenmh: course.tenmh,
                    khoa: course.khoa,
                    hocky: sem.tenhk ? `${sem.tenhk} – ${sem.namhoc}` : 'Chưa xác định',
                    giangvien: teacher.ten,
                    tenhk: sem.tenhk,
                    namhoc: sem.namhoc
                };
            });
    }, [groups, courses, teachers, semesters, search, filterKhoa, filterHocKy, filterNamHoc, semesterMap]);

    const columns = useMemo(
        () => [
            { accessorKey: 'manhom', header: 'Mã nhóm MH' },
            { accessorKey: 'tennhom', header: 'Tên nhóm MH' },
            { accessorKey: 'tenmh', header: 'Tên MH' },
            { accessorKey: 'khoa', header: 'Khoa' },
            { accessorKey: 'hocky', header: 'Học kỳ' },
            { accessorKey: 'giangvien', header: 'Giảng viên' },
            {
                id: 'actions',
                header: 'Hành động',
                cell: ({ row }) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            className="btn-edit"
                            onClick={() => navigate(`/admin/groups/edit/${row.original.id}`)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                            className="btn-delete"
                            onClick={async () => {
                                if (window.confirm('Xóa nhóm này?')) {
                                    await deleteGroup(row.original.id);
                                    const res = await getGroups();
                                    setGroups(res.data);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                )
            }
        ], [navigate, setGroups]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageIndex: 0, pageSize: 10 } }
    });

    const khoaOptions = useMemo(
        () => Array.from(new Set(courses.map(c => c.khoa))).sort(),
        [courses]
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
            <h1>Quản lý Nhóm môn học</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FontAwesomeIcon icon={faSearch} />
                <input
                    type="text"
                    placeholder="Tìm mã hoặc tên nhóm"
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
                    onClick={() => navigate('/admin/groups/add')}
                    className="btn-add"
                    style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 4 }}
                >
                    Thêm Nhóm môn học
                </button>
            </div>

            <table className="tanstack-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={{ border: '1px solid #ccc', padding: 8, backgroundColor: '#ccc' }}>
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
                                <td key={cell.id} style={{ border: '1px solid #ccc', padding: 8, verticalAlign: 'middle', backgroundColor: '#fff', }}>
                                    {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
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
