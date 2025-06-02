import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getSchedules() { return axios.get(`${BASE}/lichhoc`); }
export function getSchedule(id) { return axios.get(`${BASE}/lichhoc/${id}`); }

export function getSchedulesByGroup(manhom) {
    return axios.get(`${BASE}/lichhoc/nhom/${manhom}`);
}
export function createSchedule(data) { return axios.post(`${BASE}/lichhoc`, data); }
export function updateSchedule(id, data) { return axios.put(`${BASE}/lichhoc/${id}`, data); }
export function deleteSchedule(id) { return axios.delete(`${BASE}/lichhoc/${id}`); }

export function getSchedulesByTeacher(mgv) {
    return axios.get(`${BASE}/lichhoc/gv/${mgv}`);
}

export function getSchedulesBySemester(mahk) {
    return axios.get(`${BASE}/lichhoc/semester/${mahk}`);
}

export function deleteSchedulesBySemester(mahk) {
    return axios.delete(`${BASE}/lichhoc/semester/${mahk}`);
}


export function getRegistrationsByGroup(manhom) {
    return axios.get(`${BASE}/dangky/group/${manhom}`);
}