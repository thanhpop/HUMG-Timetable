// src/pages/student/Registration/Registration.jsx
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { getSchedules } from '../../../api/scheduleApi';
import {
    getMyRegistrations,
    createRegistration,
    deleteRegistration
} from '../../../api/dangkyApi';
import { getCurrentMsv } from '../../utils/auth';
import './style.css';

export default function Registration() {
    const [openClasses, setOpenClasses] = useState([]);
    const [myRegs, setMyRegs] = useState([]);
    const [loadingOpen, setLoadingOpen] = useState(false);
    const [loadingMy, setLoadingMy] = useState(false);

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
        })();
    }, []);

    const handleRegister = async row => {
        await createRegistration({ msv, lichhoc_id: row.id });
        const res = await getMyRegistrations();
        setMyRegs(res.data);
    };

    const handleUnreg = async row => {
        if (window.confirm('Bạn có chắc muốn hủy đăng ký?')) {
            await deleteRegistration(row.id);
            setMyRegs(myRegs.filter(d => d.id !== row.id));
        }
    };

    const openCols = [

        { name: 'Mã MH', selector: r => r.mamh },
        { name: 'Tên MH', selector: r => r.tenmh },
        { name: 'Số TC', selector: r => r.sotinchi },
        { name: 'Nhóm', selector: r => r.tennhom },

        {
            name: 'Thời gian',
            selector: r => {
                const day = `Thứ ${r.thu === 8 ? 'CN' : r.thu}`;
                const range = `${new Date(r.ngaybd).toLocaleDateString()} → ${new Date(r.ngaykt).toLocaleDateString()}`;
                const gv = `GV: ${r.tengv}`;
                const room = `Phòng: ${r.tenphong} – Khu ${r.khu}`;
                return `${day}\n${range}\n${gv},\n${room}`;
            },
            wrap: true
        },
        {
            name: 'Đăng ký',
            cell: r => <button onClick={() => handleRegister(r)}>Đăng ký</button>,
            ignoreRowClick: true
        },
    ];

    const myCols = [
        {
            name: 'xóa',
            cell: r => <button onClick={() => handleUnreg(r)}>xóa</button>,
            ignoreRowClick: true
        },
        { name: 'Mã MH', selector: r => r.mamh },
        { name: 'Tên MH', selector: r => r.tenmh },
        { name: 'Nhóm', selector: r => r.tennhom },
        { name: 'Ngày đăng ký', selector: r => new Date(r.ngaydk).toLocaleString() },

    ];

    return (
        <div className="registration-page">
            <div className="registration-header">
                <h1>Đăng ký môn học học kỳ 2 – Năm học 2024 – 2025</h1>
            </div>
            <h2>Danh sách môn học mở cho đăng ký</h2>
            <DataTable
                columns={openCols}
                data={openClasses}
                pagination
                progressPending={loadingOpen}
            />

            <h2>Danh sách môn học đã đăng ký</h2>
            <DataTable
                columns={myCols}
                data={myRegs}
                pagination
                progressPending={loadingMy}
            />
        </div>
    );
}
