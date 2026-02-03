import api from '../api/axiosConfig';

export const projectService = {
    // Fetch all projects
    getAll: async () => {
        const { data } = await api.get('/admin/projects');
        return data;
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