import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute — Role-Based Route Guard
 * 
 * Supports both direct element wrapping and Layout Route wrapping (via Outlet).
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // Not logged in → redirect to login
        if (!token) {
            return <Navigate to="/login" replace />;
        }

        // Role not in allowed list → redirect to unauthorized page
        if (allowedRoles && !allowedRoles.includes(role)) {
            console.warn(`Unauthorized access attempt: ${role} tried to access a route requiring ${allowedRoles.join(' or ')}`);
            return <Navigate to="/unauthorized" replace />;
        }

        // Return children if directly passed, otherwise return Outlet for nested routes
        return children || <Outlet />;
    } catch (error) {
        // Handle corrupted localStorage
        console.error('Session error:', error);
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
