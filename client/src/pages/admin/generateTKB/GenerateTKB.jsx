// src/components/GenerateTKB/index.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllSemesters } from '../../../api/utilsApi';
import { generateTKB } from '../../../api/tkbApi';
import { getSchedulesBySemester } from '../../../api/scheduleApi'; // mới
import { deleteSchedulesBySemester } from '../../../api/scheduleApi';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import './style.css';

export default function GenerateTKB() {
    const [semesters, setSemesters] = useState([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [tableData, setTableData] = useState([]);

    const groupByMnh = schedules => {
        const map = {};
        schedules.forEach(s => {
            if (!map[s.manhom]) {
                map[s.manhom] = {
                    manhom: s.manhom,
                    tennhom: s.tennhom,
                    mamh: s.mamh,
                    tenmh: s.tenmh,
                    sotinchi: s.sotinchi,
                    tengv: s.tengv,
                    tenphong: s.tenphong,
                    khu: s.khu,
                    sessions: []
                };
            }
            map[s.manhom].sessions.push(s);
        });
        return Object.values(map);
    };
    useEffect(() => {
        (async () => {
            const { data } = await getAllSemesters();
            setSemesters(data);
            if (data.length) setSelected(data[0].mahk);
        })();
    }, []);
    useEffect(() => {
        if (!selected) return;
        (async () => {
            try {
                const { data: schedules } = await getSchedulesBySemester(selected);
                setTableData(groupByMnh(schedules));
            } catch (err) {
                console.error('Không lấy được lịch:', err);
                // nếu muốn giữ bảng cũ, không setTableData([]) ở đây
            }
        })();
    }, [selected]);
    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm('Bạn có chắc muốn xóa toàn bộ Thời Khóa Biểu của học kỳ này?')) return;
        try {
            await deleteSchedulesBySemester(selected);
            setTableData([]);      // làm rỗng bảng
            setResult(null);       // xoá luôn kết quả thống kê
        } catch (err) {
            alert(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleClick = async () => {
        if (!selected) return;
        setLoading(true);
        setError('');

        try {
            const { data } = await generateTKB({ mahk: selected });
            setResult({ ...data, scheduled: 0 });
            // sau khi tạo xong, gọi API lấy danh sách lichhoc
            const { data: schedules } = await getSchedulesBySemester(selected);
            setTableData(groupByMnh(schedules));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    // cấu hình TanStack Table
    const columns = useMemo(() => [
        { header: 'Mã MH', accessorKey: 'mamh' },
        { header: 'Tên MH', accessorKey: 'tenmh' },
        { header: 'Nhóm', accessorKey: 'tennhom' },
        { header: 'Số TC', accessorKey: 'sotinchi' },
        { header: 'Giảng viên', accessorKey: 'tengv' },
        {
            header: 'Thời khóa biểu',
            accessorFn: row => {
                return row.sessions
                    .map(s => {
                        const thu = s.thu === 8 ? 'CN' : s.thu;
                        const tiets = `Tiết ${s.tietbd}-${s.tietkt}`;
                        const bd = new Date(s.ngaybd).toLocaleDateString('vi-VN');
                        const kt = new Date(s.ngaykt).toLocaleDateString('vi-VN');
                        return `Thứ ${thu}, ${tiets}, ${bd}→${kt}, Phòng ${s.tenphong} – khu: ${s.khu}`;
                    })
                    .join('\n');
            },
            cell: info => (
                <pre style={{ margin: 0, fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                    {info.getValue()}
                </pre>
            )
        }
    ], []);


    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div style={{ padding: 10 }}>
            <h1>Tạo Thời Khóa Biểu tự động</h1>

            <div style={{ marginBottom: 16 }}>
                <label>
                    Chọn học kỳ:{' '}
                    <select className="large-select"
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                    >
                        <option value="">-- Chọn học kỳ --</option>
                        {semesters.map(s => (
                            <option key={s.mahk} value={s.mahk}>
                                {s.tenhk} – {s.namhoc}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <button onClick={handleClick} disabled={loading || !selected || tableData.length > 0}>
                {loading ? 'Đang tạo...' : 'Tạo Thời Khóa Biểu'}
            </button>
            <button
                onClick={handleDelete}
                style={{ marginLeft: 16, backgroundColor: '#e74c3c', color: '#fff' }}
                disabled={!selected}
            >
                Xóa Thời Khóa Biểu
            </button>

            {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}


            {
                result && (
                    <div style={{ marginTop: 20 }}>
                        <h2>Kết quả:</h2>
                        <p>Đã xếp: {tableData.length} nhóm</p>
                        <h3>Thống kê:</h3>
                        <pre>{JSON.stringify(result.stats, null, 2)}</pre>
                        {result.conflicts.length > 0 && (
                            <>
                                <h3>Conflicts:</h3>
                                <ul>
                                    {result.conflicts.map((c, i) => (
                                        <li key={i}>
                                            {c.mamh}: {c.lyDo}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )
            }

            {/* Bảng TanStack Table hiển thị lichhoc */}
            {
                tableData.length > 0 && (
                    <section style={{ marginTop: 40 }}>
                        <h2>Kết quả tạo lịch học cho học kỳ: </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} style={{ border: '1px solid #ccc', padding: 8, background: '#f1f1f1' }}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} style={{ border: '1px solid #ccc', padding: 8 }}>
                                                {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )
            }
        </div >
    );
}