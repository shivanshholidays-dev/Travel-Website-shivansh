import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import useAuthStore from '../../store/useAuthStore';

export const useAuthHooks = () => {
    const { setTokens, setUser, logout } = useAuthStore();

    const useRegister = () => useMutation({
        mutationFn: (data: Parameters<typeof authApi.register>[0]) => authApi.register(data)
    });

    const useLogin = () => useMutation({
        mutationFn: (data: Parameters<typeof authApi.login>[0]) => authApi.login(data),
        onSuccess: (res) => {
            setTokens(res.data.accessToken, res.data.refreshToken);
            setUser(res.data.user);
        }
    });

    const useLogout = () => useMutation({
        mutationFn: () => authApi.logout(useAuthStore.getState().refreshToken || ''),
        onSuccess: () => logout()
    });

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const useGetMe = () => useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authApi.getMe().then(res => res.data),
        enabled: isAuthenticated,
    });

    const useForgotPassword = () => useMutation({
        mutationFn: (email: string) => authApi.forgotPassword(email)
    });

    const useResetPassword = () => useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) => authApi.resetPassword(token, password)
    });

    return {
        useRegister,
        useLogin,
        useLogout,
        useGetMe,
        useForgotPassword,
        useResetPassword
    };
};
