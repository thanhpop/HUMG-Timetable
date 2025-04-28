// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    const vaitro = localStorage.getItem('vaitro');

    if (!vaitro || (allowedRoles && !allowedRoles.includes(vaitro))) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
