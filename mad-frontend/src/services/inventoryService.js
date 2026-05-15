import api from '../api/axiosConfig';

export const inventoryService = {
    getAll: async () => {
        const { data } = await api.get('/admin/inventory');
        return data;
    },
    getLowStock: async () => {
        const { data } = await api.get('/admin/inventory/low-stock');
        return data;
    },
    create: async (item) => {
        const { data } = await api.post('/admin/inventory', item);
        return data;
    },
    update: async (id, item) => {
        const { data } = await api.put(`/admin/inventory/${id}`, item);
        return data;
    },
    delete: async (id) => {
        await api.delete(`/admin/inventory/${id}`);
    }
};
