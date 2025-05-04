// src/utils/auth.js
export function getCurrentUser() {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
}

export function getCurrentMsv() {
    const user = getCurrentUser();
    return user?.profile?.msv;
}
