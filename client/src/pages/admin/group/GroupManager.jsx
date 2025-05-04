// src/pages/admin/group/GroupManager.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getGroups, deleteGroup } from '../../../api/groupApi';
import {
    getAllCourses,
    getAllTeachers,
    getAllRooms
} from '../../../api/utilsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../style.css';

export default function GroupManager() {
    const nav = useNavigate();
    const { groups, setGroups } = useOutletContext();

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);

    // load groups + reference lists
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [gRes, cRes, tRes, rRes] = await Promise.all([
                    getGroups(),
                    getAllCourses(),
                    getAllTeachers(),
                    getAllRooms()
                ]);
                setGroups(gRes.data);
                setCourses(cRes.data);
                setTeachers(tRes.data);
                setRooms(rRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const khoaOptions = Array.from(new Set(courses.map(c => c.khoa))).sort();

    // filter groups by text and khoa
    const filtered = groups.filter(g => {
        const term = search.toLowerCase();
        const textMatch =
            g.manhom.toLowerCase().includes(term) ||
            g.tennhom.toLowerCase().includes(term);

        // lookup this group’s course to get its khoa
        const course = courses.find(c => c.mamh === g.mamh);
        const khoa = course?.khoa ?? '';
        const khoaMatch = !filterKhoa || khoa === filterKhoa;

        return textMatch && khoaMatch;
    });

    const customStyles = {
        table: { style: { backgroundColor: '#f9f9f9' } },
        headRow: { style: { backgroundColor: '#e0e0e0', fontWeight: 'bold' } },
        /* …etc… */
    };

    const columns = [
        { name: 'Mã nhóm môn học', selector: r => r.manhom, sortable: true },
        { name: 'Tên nhóm môn học', selector: r => r.tennhom, sortable: true },

        // Course code + course name
        {
            name: 'Tên Môn học',
            selector: r => {
                const c = courses.find(c => c.mamh === r.mamh);
                return c ? c.tenmh : '';
            }
        },
        {
            name: 'Khoa',
            selector: r => {
                const c = courses.find(c => c.mamh === r.mamh);
                return c ? c.khoa : '';
            },
            sortable: true
        },

        {
            name: 'Giảng viên',
            selector: r => {
                const t = teachers.find(t => t.mgv === r.mgv);
                return t ? t.ten : '';
            }
        },

        {
            name: 'Tên Phòng',
            selector: r => {
                const rm = rooms.find(rm => rm.maphong === r.maphong);
                return rm ? rm.tenphong : '';
            }
        },

        {
            name: 'Hành động',
            cell: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => nav(`/admin/groups/view/${r.manhom}`)} className="btn-view">Xem</button>
                    <button onClick={() => nav(`/admin/groups/edit/${r.manhom}`)} className="btn-edit">Sửa</button>
                    <button onClick={async () => {
                        if (window.confirm('Xóa?')) {
                            await deleteGroup(r.manhom);
                            const res = await getGroups();
                            setGroups(res.data);
                        }
                    }} className="btn-delete">Xóa</button>
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
                    style={{ padding: 8, width: 300, fontSize: 14 }}
                />
                <select
                    value={filterKhoa}
                    onChange={e => setFilterKhoa(e.target.value)}
                    style={{ padding: 8, fontSize: 14 }}
                >
                    <option value="">-- Tất cả khoa --</option>
                    {khoaOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </div>
            <div style={{ textAlign: 'right', margin: '16px 0' }}>
                <button onClick={() => nav('/admin/groups/add')} className="btn-add">Thêm Nhóm môn học</button>
            </div>
            <DataTable
                columns={columns}
                data={filtered}
                pagination
                progressPending={loading}
                customStyles={customStyles}
                persistTableHead
            />
        </div>
    );
}
