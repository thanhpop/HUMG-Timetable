import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getGroups() { return axios.get(`${BASE}/nhommh`); }
export function getGroup(manhom) { return axios.get(`${BASE}/nhommh/${manhom}`); }
export function createGroup(data) { return axios.post(`${BASE}/nhommh`, data); }
export function updateGroup(manhom, data) { return axios.put(`${BASE}/nhommh/${manhom}`, data); }
export function deleteGroup(manhom) { return axios.delete(`${BASE}/nhommh/${manhom}`); }
