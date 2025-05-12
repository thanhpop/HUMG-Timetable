// src/utils/auth.js
export function getCurrentUser() {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
}

export function getCurrentMsv() {
    const user = getCurrentUser();
    return user?.profile?.msv;
}
export function getCurrentMgv() {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.profile?.mgv || ''; // hoặc user.msv tuỳ bạn lưu key nào
}