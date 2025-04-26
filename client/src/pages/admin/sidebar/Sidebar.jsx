// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
    return (
        <div className="sidebar">
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
            </ul>
        </div>
    );
}
