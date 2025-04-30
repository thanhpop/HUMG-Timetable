// src/api/utilsApi.js
import axios from 'axios';
const BASE = 'http://localhost:3001';


export function getAllCourses() {
    return axios.get(`${BASE}/courses`);
}
export function getAllTeachers() {
    return axios.get(`${BASE}/teachers`);
}
export function getAllRooms() {
    return axios.get(`${BASE}/rooms`);
}
export function getAllSemesters() {
    return axios.get(`${BASE}/semesters`);
}
