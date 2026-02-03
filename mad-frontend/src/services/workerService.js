import api from '../api/axiosConfig';

export const workerService = {
    // Fetch all workers
    getAllWorkers: async () => {
        const { data } = await api.get('/labour/all');
        return data;
    },

    // Get worker by ID
    getWorkerById: async (id) => {
        const { data } = await api.get(`/labour/${id}`);
        return data;
    },

    // Get workers by Project ID
    getWorkersByProject: async (projectId) => {
        const { data } = await api.get(`/labour/project/${projectId}`);
        return data;
    },

    // Create a new worker
    createWorker: async (workerData) => {
        const { data } = await api.post('/labour/add', workerData);
        return data;
    },

    // Update worker details
    updateWorker: async (id, workerData) => {
        const { data } = await api.put(`/labour/${id}`, workerData);
        return data;
    },

    // Delete a worker
    deleteWorker: async (id) => {
        const { data } = await api.delete(`/labour/${id}`);
        return data;
    }
};
