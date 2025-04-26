import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getCourses() { return axios.get(`${BASE}/courses`); }
export function getCourse(id) { return axios.get(`${BASE}/courses/${id}`); }
export function createCourse(data) { return axios.post(`${BASE}/courses`, data); }
export function updateCourse(id, data) { return axios.put(`${BASE}/courses/${id}`, data); }
export function deleteCourse(id) { return axios.delete(`${BASE}/courses/${id}`); }