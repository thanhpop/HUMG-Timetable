import axios from 'axios';
const BASE = 'http://localhost:3001';

export function getRooms() { return axios.get(`${BASE}/rooms`); }
export function getRoom(maphong) { return axios.get(`${BASE}/rooms/${maphong}`); }
export function createRoom(data) { return axios.post(`${BASE}/rooms`, data); }
export function updateRoom(maphong, d) { return axios.put(`${BASE}/rooms/${maphong}`, d); }
export function deleteRoom(maphong) { return axios.delete(`${BASE}/rooms/${maphong}`); }
