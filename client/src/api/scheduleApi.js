import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getSchedules() { return axios.get(`${BASE}/lichhoc`); }
export function getSchedule(id) { return axios.get(`${BASE}/lichhoc/${id}`); }
export function createSchedule(data) { return axios.post(`${BASE}/lichhoc`, data); }
export function updateSchedule(id, data) { return axios.put(`${BASE}/lichhoc/${id}`, data); }
export function deleteSchedule(id) { return axios.delete(`${BASE}/lichhoc/${id}`); }
