// src/api/dangkyApi.js
import axios from 'axios';
const BASE = 'http://localhost:3001';

// Lấy đăng ký của chính sinh viên
export function getMyRegistrations() {
    const msv = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).profile.msv
        : '';
    return axios.get(`${BASE}/dangky/${msv}`);
}

// Tạo đăng ký
export function createRegistration(data) {
    // data phải gồm { msv, lichhoc_id }
    return axios.post(`${BASE}/dangky`, data);
}

// Hủy đăng ký
export function deleteRegistration(id) {
    return axios.delete(`${BASE}/dangky/${id}`);
}


export const getCountByLichHoc = () => axios.get(`${BASE}/dangky/count-by-lichhoc`);