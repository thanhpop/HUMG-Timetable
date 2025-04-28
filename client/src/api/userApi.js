import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getUsers() {
    return axios.get(`${BASE}/users`);
}

export function getUserById(id) {
    return axios.get(`${BASE}/users/${id}`);
}

export function createUser(data) {
    return axios.post(`${BASE}/users`, data);
}

export function updateUser(id, data) {
    return axios.put(`${BASE}/users/${id}`, data);
}

export function deleteUser(id) {
    return axios.delete(`${BASE}/users/${id}`);
}
