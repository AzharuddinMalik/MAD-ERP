import api from '../api/axiosConfig';

export const attendanceService = {
    // Submit attendance for a project
    markAttendance: async (payload) => {
        const { data } = await api.post('/labour/attendance', payload);
        return data;
    },

    // Get attendance for a specific project
    getProjectAttendance: async (projectId) => {
        const { data } = await api.get(`/labour/project/${projectId}/attendance`);
        return data;
    },

    // Validate attendance (check for duplicates/conflicts)
    validateAttendance: async (workerId, date) => {
        // This endpoint assumes backend implementation for validation
        const { data } = await api.post('/labour/attendance/validate', { workerId, date });
        return data;
    }
};
