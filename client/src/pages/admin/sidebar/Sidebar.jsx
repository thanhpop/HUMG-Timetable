// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import logoHumg from '../../login/pic/logoHumg.png';

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
        <div className="sidebar-admin" >

            <div className="sidebar-header">
                <img src={logoHumg} alt="HUMG Logo" className="sidebar-logo" />
                <h3 className="sidebar-title">Trang admin</h3>
            </div>
            <hr className="sidebar-divider" />
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
                    <NavLink to="/admin/generatetkb" className={({ isActive }) => isActive ? 'active' : ''}>
                        Tạo lịch học tự động
                    </NavLink>
                </li>



            </ul>

            <div className="sidebar-footer-admin">
                <button onClick={handleLogout} className="logout-button-admin">
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
