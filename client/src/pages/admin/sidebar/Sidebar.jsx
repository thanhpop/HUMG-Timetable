// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
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
                        Quản lý người dùng
                    </NavLink>
                </li>


            </ul>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
