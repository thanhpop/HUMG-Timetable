// src/api/teacherApi.js
import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getTeachers() {
    return axios.get(`${BASE}/teachers`);
}
export function getTeacher(id) {
    return axios.get(`${BASE}/teachers/${id}`);
}
export function createTeacher(data) {
    return axios.post(`${BASE}/teachers`, data);
}
export function updateTeacher(id, data) {
    return axios.put(`${BASE}/teachers/${id}`, data);
}
export function deleteTeacher(id) {
    return axios.delete(`${BASE}/teachers/${id}`);
}
