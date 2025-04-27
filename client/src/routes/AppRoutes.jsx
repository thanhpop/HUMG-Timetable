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

import CourseManager from '../pages/admin/course/CourseManager.jsx';
import AddCourse from '../pages/admin/course/AddCourse.jsx';
import EditCourse from '../pages/admin/course/EditCourse.jsx';

import RoomManager from '../pages/admin/room/RoomManager.jsx';
import AddRoom from '../pages/admin/room/AddRoom.jsx';
import EditRoom from '../pages/admin/room/EditRoom.jsx';

import SemesterManager from '../pages/admin/semester/SemesterManager.jsx';
import AddSemester from '../pages/admin/semester/AddSemester.jsx';
import EditSemester from '../pages/admin/semester/EditSemester.jsx';

import Home from '../pages/home/Home.jsx';

import Login from '../pages/login/Login.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/admin" element={<Dashboard />}>
                <Route index element={<StudentManager />} />
                <Route path="students" element={<StudentManager />} />
                <Route path="students/add" element={<AddStudent />} />
                <Route path="students/edit/:msv" element={<EditStudent />} />
                <Route path="students/view/:msv" element={<ViewStudent />} />
                <Route path="teachers" element={<TeacherManager />} />
                <Route path="teachers/add" element={<AddTeacher />} />
                <Route path="teachers/edit/:mgv" element={<EditTeacher />} />
                <Route path="teachers/view/:mgv" element={<ViewTeacher />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="courses/add" element={<AddCourse />} />
                <Route path="courses/edit/:mamh" element={<EditCourse />} />
                <Route path="rooms" element={<RoomManager />} />
                <Route path="rooms/add" element={<AddRoom />} />
                <Route path="rooms/edit/:maphong" element={<EditRoom />} />
                <Route path="semesters" element={<SemesterManager />} />
                <Route path="semesters/add" element={<AddSemester />} />
                <Route path="semesters/edit/:mahk" element={<EditSemester />} />

            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />


        </Routes>
    );
}
