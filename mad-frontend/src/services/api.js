const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('🚧 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('✅ Final API_URL used:', API_URL);

/**
 * Get full API URL for a given path
 * @param {string} path - API path (e.g., '/api/users' or '/uploads/image.jpg')
 * @returns {string} Full URL
 */
export const getApiUrl = (path) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
};

export default API_URL;
