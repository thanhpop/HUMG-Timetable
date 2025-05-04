// src/routes/AppRoutes.jsx
import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import DashboardAdmin from '../pages/admin/dashboard/DashboardAdmin.jsx';

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

import UserManager from '../pages/admin/user/UserManager.jsx';
import AddUser from '../pages/admin/user/AddUser.jsx';
import EditUser from '../pages/admin/user/EditUser.jsx';

import GroupManager from '../pages/admin/group/GroupManager.jsx';
import AddGroup from '../pages/admin/group/AddGroup.jsx';
import ViewGroup from '../pages/admin/group/ViewGroup.jsx';
import EditGroup from '../pages/admin/group/EditGroup.jsx';
// import Home from '../pages/home/Home.jsx';
import DashboardStudent from '../pages/student/dashboard/DashboardStudent.jsx';
import StudentInfo from '../pages/student/info/studentInfo.jsx';

import DashboardTeacher from '../pages/teacher/dashboard/DashboardTeacher.jsx';
import TeacherInfo from '../pages/teacher/info/TeacherInfo.jsx';

import ScheduleManager from '../pages/admin/schedule/ScheduleManager.jsx';
import AddSchedule from '../pages/admin/schedule/AddSchedule.jsx';
import EditSchedule from '../pages/admin/schedule/EditSchedule.jsx';
import ViewSchedule from '../pages/admin/schedule/ViewSchedule.jsx';

import DotDKManager from '../pages/admin/dotdangky/DotDKManager.jsx';
import AddDotDK from '../pages/admin/dotdangky/AddDotDK.jsx';
import EditDotDK from '../pages/admin/dotdangky/EditDotDK.jsx';


import Registration from '../pages/student/Registration.jsx';

import Login from '../pages/login/Login.jsx';


export default function AppRoutes() {

    return (
        <Routes>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}>
                <DashboardAdmin />
            </ProtectedRoute>}>
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
                <Route path="users" element={<UserManager />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="users/edit/:id" element={<EditUser />} />
                <Route path="groups" element={<GroupManager />} />
                <Route path="groups/add" element={<AddGroup />} />
                <Route path="groups/edit/:manhom" element={<EditGroup />} />
                <Route path="groups/view/:manhom" element={<ViewGroup />} />
                <Route path="/admin/lichhoc" element={<ScheduleManager />} />
                <Route path="/admin/lichhoc/add" element={<AddSchedule />} />
                <Route path="/admin/lichhoc/edit/:id" element={<EditSchedule />} />
                <Route path="/admin/lichhoc/view/:id" element={<ViewSchedule />} />
                <Route path="/admin/dotdangky" element={<DotDKManager />} />
                <Route path="/admin/dotdangky/add" element={<AddDotDK />} />
                <Route path="/admin/dotdangky/edit/:id" element={<EditDotDK />} />
            </Route>
            <Route path="/student" element={<ProtectedRoute allowedRoles={['sv']}>
                <DashboardStudent />
            </ProtectedRoute>} >
                <Route path="info" element={<StudentInfo />} />
                <Route path="registration" element={<Registration />} />
            </Route>
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['gv']}>
                <DashboardTeacher />
            </ProtectedRoute>} >
                <Route path="info" element={<TeacherInfo />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />






        </Routes>
    );
}
