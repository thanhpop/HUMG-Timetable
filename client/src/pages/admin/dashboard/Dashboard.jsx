// src/pages/Admin/AdminPage.jsx
import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    return (
        <div className="container">

            <Sidebar />

            <div className="main-content">

                <Outlet context={{ students, setStudents, teachers, setTeachers, courses, setCourses, rooms, setRooms, semesters, setSemesters }} />
            </div>

        </div>
    );
}
