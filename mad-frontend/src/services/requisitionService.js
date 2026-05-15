import api from '../api/axiosConfig';

export const requisitionService = {
    submit: async (data) => {
        const { data: response } = await api.post('/requisitions', data);
        return response;
    },
    getMyRequests: async () => {
        const { data } = await api.get('/requisitions/my');
        return data;
    },
    getAll: async () => {
        const { data } = await api.get('/requisitions/all');
        return data;
    },
    updateStatus: async (id, status, remarks) => {
        const { data } = await api.patch(`/requisitions/${id}/status?status=${status}&remarks=${remarks || ''}`);
        return data;
    },
    assignVendor: async (id, vendorId, unitPrice, totalCost) => {
        const { data } = await api.patch(`/requisitions/${id}/assign-vendor?vendorId=${vendorId}&unitPrice=${unitPrice}&totalCost=${totalCost}`);
        return data;
    },
    receiveMaterial: async (id, quantity) => {
        const { data } = await api.post(`/requisitions/${id}/receive?quantity=${quantity}`);
        return data;
    }
};
