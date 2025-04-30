// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
    const [openSchedule, setOpenSchedule] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem('vaitro');
        // Nếu bạn lưu thêm token hoặc user thì xóa ở đây luôn
        // localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
    };
    return (
        <div className="sidebar-admin">

            <h2>Trang admin</h2>
            <ul>
                <li>
                    <NavLink to="/admin/students" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý sinh viên
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/teachers" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý giảng viên
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/courses" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý môn học
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/rooms" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý phòng học
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/semesters" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý học kỳ
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/groups" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý nhóm môn học
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                        Quản lý tài khoản
                    </NavLink>
                </li>
                <li>
                    <div
                        onClick={() => setOpenSchedule(prev => !prev)}
                        className={`submenu-toggle ${openSchedule ? 'open' : ''}`}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px' }}
                    >
                        <span>Quản lý thời khóa biểu</span>
                        <span>{openSchedule ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                    </div>
                    {openSchedule && (
                        <ul className="submenu">
                            <li>
                                <NavLink to="/admin/lichhoc" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Quản lý lịch học
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/registration-periods" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Quản lý đợt đăng ký
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>



            </ul>

            <div className="sidebar-footer-admin">
                <button onClick={handleLogout} className="logout-button-admin">
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
