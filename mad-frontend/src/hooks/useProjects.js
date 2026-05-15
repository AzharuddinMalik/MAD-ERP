import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import api from '../api/axiosConfig';

export const useProjects = () => {
    const queryClient = useQueryClient();

    // 1. Query: Fetch Projects
    const projectsQuery = useQuery({
        queryKey: ['projects'],
        queryFn: projectService.getAll,
        staleTime: 1000 * 60 * 5,
    });

    // 2. Query: Fetch Cities
    const citiesQuery = useQuery({
        queryKey: ['cities'],
        queryFn: projectService.getCities,
        staleTime: 1000 * 60 * 5, // Reduce from Infinity to 5 mins
    });

    // 2.5 Query: Fetch Supervisors (Only for Admins)
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'ROLE_ADMIN';

    const supervisorsQuery = useQuery({
        queryKey: ['supervisors'],
        queryFn: async () => {
            if (!isAdmin) return [];
            const { data } = await api.get('/admin/supervisors');
            return data;
        },
        enabled: isAdmin,
        staleTime: 1000 * 60 * 5,
    });

    // 3. Mutation: Delete Project (using mutateAsync for true verification)
    const deleteMutation = useMutation({
        mutationFn: projectService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });

    // 4. Mutation: Update Project
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => projectService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
        }
    });

    return {
        projects: projectsQuery.data || [],
        cities: citiesQuery.data || [],
        supervisors: supervisorsQuery.data || [],
        isLoading: projectsQuery.isLoading || citiesQuery.isLoading,
        error: projectsQuery.error,
        deleteProject: deleteMutation.mutateAsync,
        updateProject: updateMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending
    };
};