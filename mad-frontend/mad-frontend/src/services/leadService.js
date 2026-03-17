import api from '../api/axiosConfig';

export const leadService = {
    /**
     * Submit a new lead/inquiry from landing page forms.
     * @param {Object} data 
     * @param {string} data.name
     * @param {string} data.phone
     * @param {string} [data.email]
     * @param {string} [data.city]
     * @param {string} [data.serviceNeeded]
     * @param {string} [data.message]
     * @param {string} data.source - 'hero' or 'contact'
     * @param {boolean} data.whatsappConsent
     */
    submitLead: async (data) => {
        try {
            // Note: Since this is public, we post directly without auth limits
            const response = await api.post('/public/leads', data);
            return response.data;
        } catch (error) {
            console.error('Error submitting lead:', error);
            throw error.response?.data || 'Failed to submit lead';
        }
    },

    /**
     * Get all leads (Admin only)
     */
    getAllLeads: async () => {
        try {
            const response = await api.get('/admin/leads');
            return response.data;
        } catch (error) {
            console.error('Error fetching leads:', error);
            throw error;
        }
    },

    /**
     * Update lead status (Admin only)
     * @param {number} id 
     * @param {string} status - NEW, CONTACTED, CLOSED
     */
    updateStatus: async (id, status) => {
        try {
            const response = await api.put(`/admin/leads/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating lead status:', error);
            throw error;
        }
    },

    /**
     * Get leads summary stats for the dashboard widget
     */
    getLeadsStats: async () => {
        try {
            const response = await api.get('/admin/leads/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching lead stats:', error);
            throw error;
        }
    }
};
