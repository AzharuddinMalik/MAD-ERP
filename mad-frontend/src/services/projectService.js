import api from '../api/axiosConfig';

export const projectService = {
    // Fetch all projects (Paginated from Component 4)
    getAll: async ({ page = 0, size = 100 } = {}) => {
        const { data } = await api.get('/projects', { params: { page, size } });
        // Return content array if paginated, otherwise fallback to data
        return data.content !== undefined ? data.content : data;
    },

    // Fetch cities (for the dropdown)
    getCities: async () => {
        const { data } = await api.get('/admin/cities');
        return data;
    },

    // Update a project
    update: async (id, payload) => {
        const { data } = await api.put(`/admin/projects/${id}`, payload);
        return data;
    },

    // Delete a project
    delete: async (id) => {
        const { data } = await api.delete(`/admin/projects/${id}`);
        return data;
    }
};