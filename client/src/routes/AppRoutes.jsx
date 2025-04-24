// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/dashboard/Dashboard.jsx';
import StudentManager from '../pages/admin/student/StudentManager.jsx';
import AddStudent from '../pages/admin/student/AddStudent.jsx';
import EditStudent from '../pages/admin/student/EditStudent.jsx';
import ViewStudent from '../pages/admin/student/ViewStudent.jsx';
import LecturerManager from '../pages/admin/lecturer/LecturerManager.jsx';
import Home from '../pages/home/Home.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/admin" element={<Dashboard />}>
                <Route index element={<StudentManager />} />
                <Route path="students" element={<StudentManager />} />
                <Route path="students/add" element={<AddStudent />} />
                <Route path="students/edit/:id" element={<EditStudent />} />
                <Route path="students/view/:id" element={<ViewStudent />} />
                <Route path="lecturers" element={<LecturerManager />} />
            </Route>
            <Route path="/" element={<Home />} />


        </Routes>
    );
}
