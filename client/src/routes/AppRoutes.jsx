// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/dashboard/Dashboard.jsx';
import StudentManager from '../pages/admin/student/StudentManager.jsx';
import AddStudent from '../pages/admin/student/AddStudent.jsx';
import EditStudent from '../pages/admin/student/EditStudent.jsx';
import ViewStudent from '../pages/admin/student/ViewStudent.jsx';
import TeacherManager from '../pages/admin/teacher/TeacherManager.jsx';
import AddTeacher from '../pages/admin/teacher/AddTeacher.jsx';
import EditTeacher from '../pages/admin/teacher/EditTeacher.jsx';
import ViewTeacher from '../pages/admin/teacher/ViewTeacher.jsx';
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
                <Route path="teachers" element={<TeacherManager />} />
                <Route path="teachers/add" element={<AddTeacher />} />
                <Route path="teachers/edit/:id" element={<EditTeacher />} />
                <Route path="teachers/view/:id" element={<ViewTeacher />} />
            </Route>
            <Route path="/" element={<Home />} />


        </Routes>
    );
}
