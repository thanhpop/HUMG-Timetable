import axios from 'axios';
const BASE = 'http://localhost:3001';

export const getDotDK = () => axios.get(`${BASE}/dotdangky`);
export const getDotDKById = id => axios.get(`${BASE}/dotdangky/${id}`);
export const createDotDK = data => axios.post(`${BASE}/dotdangky`, data);
export const updateDotDK = (id, data) => axios.put(`${BASE}/dotdangky/${id}`, data);
export const deleteDotDK = id => axios.delete(`${BASE}/dotdangky/${id}`);
