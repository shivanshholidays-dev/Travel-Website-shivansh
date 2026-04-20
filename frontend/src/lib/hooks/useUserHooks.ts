import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { SavedTraveler, User } from '../types/user.types';
import useAuthStore from '../../store/useAuthStore';

export const useUserHooks = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();

    // Use reactive selector so `enabled` updates whenever auth state changes
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const useProfile = () => useQuery({
        queryKey: ['users', 'profile'],
        queryFn: () => usersApi.getProfile(),
        enabled: isAuthenticated,   // reactive — re-evaluates on store change
        staleTime: 5 * 60 * 1000,  // 5 min
        retry: 1,
    });

    const useUpdateProfile = () => useMutation({
        mutationFn: (data: Partial<User>) => usersApi.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
            setUser(updatedUser);
        }
    });

    const useChangePassword = () => useMutation({
        mutationFn: (data: any) => usersApi.changePassword(data)
    });

    const useSavedTravelers = () => useQuery({
        queryKey: ['users', 'travelers'],
        queryFn: () => usersApi.getSavedTravelers(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    const useAddTraveler = () => useMutation({
        mutationFn: (data: Omit<SavedTraveler, '_id'>) => usersApi.addTraveler(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'travelers'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
        }
    });

    const useRemoveTraveler = () => useMutation({
        mutationFn: (id: string) => usersApi.removeTraveler(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'travelers'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
        }
    });

    const useDashboardSummary = () => useQuery({
        queryKey: ['users', 'dashboard-summary'],
        queryFn: () => usersApi.getDashboardSummary(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    return {
        useProfile,
        useUpdateProfile,
        useChangePassword,
        useSavedTravelers,
        useAddTraveler,
        useRemoveTraveler,
        useDashboardSummary
    };
};
