import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import api from '../api/axiosConfig'; // Needed for supervisors
import { toast } from 'react-hot-toast'; // Replaces alert()

export const useProjects = () => {
    const queryClient = useQueryClient();

    // 1. Query: Fetch Projects (Auto-caches & Handles Loading)
    const projectsQuery = useQuery({
        queryKey: ['projects'],
        queryFn: projectService.getAll,
        staleTime: 1000 * 60 * 5, // Data stays fresh for 5 mins
    });

    // 2. Query: Fetch Cities
    const citiesQuery = useQuery({
        queryKey: ['cities'],
        queryFn: projectService.getCities,
        staleTime: Infinity, // Cities rarely change, fetch once
    });

    // 2.5 Query: Fetch Supervisors
    const supervisorsQuery = useQuery({
        queryKey: ['supervisors'],
        queryFn: async () => {
            const { data } = await api.get('/admin/supervisors'); // Direct call or move to service
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });

    // 3. Mutation: Delete Project (Auto-refreshes list on success)
    const deleteMutation = useMutation({
        mutationFn: projectService.delete,
        onSuccess: () => {
            toast.success("Project deleted successfully");
            queryClient.invalidateQueries(['projects']); // Refetches list automatically!
        },
        onError: () => toast.error("Failed to delete project")
    });

    // 4. Mutation: Update Project
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => projectService.update(id, data),
        onSuccess: () => {
            toast.success("Project updated successfully");
            queryClient.invalidateQueries(['projects']);
        },
        onError: () => toast.error("Failed to update project")
    });

    return {
        projects: projectsQuery.data || [],
        cities: citiesQuery.data || [],
        supervisors: supervisorsQuery.data || [],
        isLoading: projectsQuery.isLoading || citiesQuery.isLoading,
        error: projectsQuery.error,
        deleteProject: deleteMutation.mutate,
        updateProject: updateMutation.mutate,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending
    };
};