// src/pages/Admin/AdminPage.jsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import './DashboardAdmin.css';

export default function DashboardAdmin() {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [schedules, setSchedules] = useState([]);

    return (
        <div className="container">

            <Sidebar />

            <div className="main-content">

                <Outlet context={{ students, setStudents, teachers, setTeachers, courses, setCourses, rooms, setRooms, semesters, setSemesters, users, setUsers, groups, setGroups, schedules, setSchedules }} />
            </div>

        </div>
    );
}
