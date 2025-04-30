import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchedule } from '../../../api/scheduleApi';
import '../style.css';

export default function ViewSchedule() {
    const { id } = useParams();
    const nav = useNavigate();
    const [sch, setSch] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await getSchedule(id);
            setSch(res.data);
        })();
    }, [id]);

    if (!sch) return <div>Loading…</div>;

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết Lịch học</h2>
                <div className="view-content">
                    <p><strong>ID:</strong> {sch.id}</p>
                    <p><strong>Mã nhóm:</strong> {sch.manhom}</p>
                    <p><strong>Thứ:</strong> Thứ {sch.thu === 8 ? 'CN' : sch.thu}</p>
                    <p><strong>Tiết:</strong> {sch.tietbd}–{sch.tietkt}</p>
                    <p><strong>Ngày BD:</strong> {new Date(sch.ngaybd).toLocaleDateString()}</p>
                    <p><strong>Ngày KT:</strong> {new Date(sch.ngaykt).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => nav(-1)}>Quay lại</button>
            </div>
        </div>
    );
}

