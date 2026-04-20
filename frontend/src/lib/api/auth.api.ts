import axiosInstance from './axios';

export const authApi = {
    login: (data: { email: string; password: string }) =>
        axiosInstance.post('/auth/login', data).then((r) => r.data),

    register: (data: { name: string; email: string; phone: string; password: string }) =>
        axiosInstance.post('/auth/register', data).then((r) => r.data),

    getMe: () => axiosInstance.get('/auth/me').then((r) => r.data),

    logout: (refreshToken: string) =>
        axiosInstance.post('/auth/logout', { refreshToken }).then((r) => r.data),

    forgotPassword: (email: string) =>
        axiosInstance.post('/auth/forgot-password', { email }).then((r) => r.data),

    resetPassword: (token: string, password: string) =>
        axiosInstance.post('/auth/reset-password', { token, password }).then((r) => r.data),

    refresh: (refreshToken: string) =>
        axiosInstance.post('/auth/refresh', { refreshToken }).then((r) => r.data),
};
