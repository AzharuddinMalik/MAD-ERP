import api from '../api/axiosConfig';

export const dashboardService = {
    // Fetch all dashboard data
    getDashboardData: async () => {
        const { data } = await api.get('/dashboard/data');
        return data;
    }
};
