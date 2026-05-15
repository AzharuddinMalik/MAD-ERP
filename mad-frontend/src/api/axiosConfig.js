import axios from 'axios';
import API_URL from '../services/api';

// Create an instance of axios with the base URL of your Spring Boot Backend
const api = axios.create({
    // Change this if your backend runs on a different port or context path
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 🛡️ Request Tracking for Cancellation (Fix 5 in Incident Report)
const pendingRequests = new Map();

// Request Interceptor: Attaches the JWT token & Manages Cancellation
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cancel existing pending request for the same URL (Prevents Request Storms)
        const requestKey = `${config.method}:${config.url}`;
        if (pendingRequests.has(requestKey)) {
            pendingRequests.get(requestKey).abort();
        }

        const controller = new AbortController();
        config.signal = controller.signal;
        pendingRequests.set(requestKey, controller);

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Cleanup tracking
api.interceptors.response.use(
    (response) => {
        const requestKey = `${response.config.method}:${response.config.url}`;
        pendingRequests.delete(requestKey);
        // ... rest of contract validation ...
        // D4.1: Validate critical fields exist on project responses
        if (response.config.url?.includes('/projects') && Array.isArray(response.data?.content || response.data)) {
            const projects = response.data.content || response.data;
            projects.forEach(p => {
                if (p.id !== undefined && typeof p.id !== 'number') {
                    console.error('CONTRACT VIOLATION: project.id must be Long (number), got:', typeof p.id);
                }
                if (p.status && !['RUNNING','PAUSED','COMPLETED','DELAYED','ON_HOLD','CANCELLED', 'INVOICED'].includes(p.status)) {
                    console.error('CONTRACT VIOLATION: project.status must be enum, got:', p.status);
                }
            });
        }
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, config } = error.response;
            console.error(`🔴 API Error ${status} on ${config.url}:`, error.response.data);

            if (status === 401) {
                // 🟢 Token Expired or Invalid → Clear session and redirect to login
                console.warn("Session expired. Redirecting to login...");
                localStorage.clear();
                window.location.href = '/login';
            } else if (status === 429) {
                // 🛡️ Rate limit reached
                console.warn("⚠️ Rate limit reached. Stopping request loop to prevent IP ban.");
            } else if (status === 403) {
                // 🛡️ Forbidden (No Permission)
                console.warn("🚫 Access Denied. Check your user permissions.");
            }
        } else {
            // 🛡️ IGNORE CanceledError (Intentional cancellations during navigation)
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }
            console.error("🔴 Network Error or No Response:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;