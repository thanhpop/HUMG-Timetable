import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroup } from '../../../api/groupApi';
import '../style.css';

export default function ViewGroup() {
    const { manhom } = useParams();
    const nav = useNavigate();
    const [g, setG] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await getGroup(manhom);
            setG(res.data);
        })();
    }, [manhom]);

    if (!g) return <div>Loading…</div>;

    return (
        <div className="view-wrapper">
            <div className="view-card">
                <h2 className="view-title">Chi tiết Nhóm</h2>
                <div className="view-content">
                    <p><strong>Mã nhóm:</strong> {g.manhom}</p>
                    <p><strong>Tên nhóm:</strong> {g.tennhom}</p>
                    <p><strong>Mã MH:</strong> {g.mamh}</p>
                    <p><strong>Mã GV:</strong> {g.mgv}</p>
                    <p><strong>Phòng:</strong> {g.maphong}</p>
                    <p><strong>Số SV:</strong> {g.soluongsv}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => nav(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
