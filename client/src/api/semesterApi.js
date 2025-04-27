import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getSemesters() { return axios.get(`${BASE}/semesters`); }
export function getSemester(mahk) { return axios.get(`${BASE}/semesters/${mahk}`); }
export function createSemester(d) { return axios.post(`${BASE}/semesters`, d); }
export function updateSemester(mahk, d) { return axios.put(`${BASE}/semesters/${mahk}`, d); }
export function deleteSemester(mahk) { return axios.delete(`${BASE}/semesters/${mahk}`); }
