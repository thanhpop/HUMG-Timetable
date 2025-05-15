import axios from 'axios';
const API_BASE = 'http://localhost:3001/api';

// truyền vào mã học kỳ bạn muốn generate
export function generateTKB({ mahk }) {
    return axios.post(`${API_BASE}/tkb/`, { mahk });
}