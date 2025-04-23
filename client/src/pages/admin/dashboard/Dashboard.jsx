// src/pages/Admin/AdminPage.jsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    return (
        <div className="container">

            <Sidebar />

            <div className="main-content">

                <Outlet context={{ students, setStudents }} />
            </div>

        </div>
    );
}
