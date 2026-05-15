import api from '../api/axiosConfig';

const financialService = {
    getFinancialSummary: async () => {
        const response = await api.get('/admin/financials/summary');
        return response.data;
    },
    getProjectFinancials: async (projectId) => {
        const response = await api.get(`/admin/financials/project/${projectId}`);
        return response.data;
    },
    getVendorFinancials: async () => {
        const response = await api.get('/admin/financials/vendors');
        return response.data;
    },
    markAsPaid: async (requisitionId) => {
        const response = await api.post(`/admin/financials/requisition/${requisitionId}/pay`);
        return response.data;
    },
    getProductivitySummary: async () => {
        const response = await api.get('/admin/financials/productivity');
        return response.data;
    }
};

export default financialService;
