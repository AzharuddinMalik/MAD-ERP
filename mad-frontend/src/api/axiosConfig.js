import API_URL from '../services/api';

// Create an instance of axios with the base URL of your Spring Boot Backend
const api = axios.create({
    // Change this if your backend runs on a different port or context path
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor: Attaches the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles 403/401 errors (Optional but recommended)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Auto-logout if token is invalid
            // localStorage.clear();
            // window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;