const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('🚧 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('✅ Final API_URL used:', API_URL);

/**
 * Get full API URL for a given path
 * @param {string} path - API path (e.g., '/api/users' or '/uploads/image.jpg')
 * @returns {string} Full URL
 */
export const getApiUrl = (path = '') => {
    // Return base URL if no path or invalid path
    if (!path || typeof path !== 'string') return API_URL;
    
    // Do not prepend API_URL if path is already an absolute HTTP/HTTPS URL or Base64 Data URI
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // If the path is just a filename (from legacy DB records) and an image, prepend /uploads
    if (!normalizedPath.startsWith('/uploads/') && !normalizedPath.startsWith('/api/') && normalizedPath.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        normalizedPath = `/uploads${normalizedPath}`;
    }

    return `${API_URL.replace(/\/$/, '')}${normalizedPath}`;
};

export default API_URL;
