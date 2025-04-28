// src/pages/student/DashboardStudent.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from "../sidebar/sidebar.jsx";

// Dashboard sinh viên
export default function DashboardStudent() {
    return (

        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar cố định bên trái */}


            {/* Nội dung chính */}
            <div style={{ flex: 1, padding: "20px" }}>
                <Outlet />
            </div>
            <Sidebar />
        </div>

    );
}
