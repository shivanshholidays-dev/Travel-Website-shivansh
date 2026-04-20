import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tre:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined')
        {
            try
            {
                const raw = localStorage.getItem('auth-storage');
                if (raw)
                {
                    const parsed = JSON.parse(raw);
                    const token = parsed?.state?.accessToken;
                    if (token)
                    {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            } catch
            {
                // ignore parse errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: 401 → refresh → retry ──────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry)
        {
            // Do not intercept 401s for the login or register endpoints
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register'))
            {
                return Promise.reject(error);
            }

            if (isRefreshing)
            {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try
            {
                const raw = localStorage.getItem('auth-storage');
                const parsed = raw ? JSON.parse(raw) : null;
                const refreshToken = parsed?.state?.refreshToken;

                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axiosInstance.post('/auth/refresh', { refreshToken });
                const newAccessToken: string = data.data?.accessToken || data.accessToken;

                // Update stored token
                if (parsed)
                {
                    parsed.state.accessToken = newAccessToken;
                    localStorage.setItem('auth-storage', JSON.stringify(parsed));
                }

                axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return axiosInstance(originalRequest);
            } catch (err)
            {
                processQueue(err, null);
                // Clear auth and redirect to login
                localStorage.removeItem('auth-storage');
                if (typeof window !== 'undefined')
                {
                    const currentPath = window.location.pathname + window.location.search;
                    const redirectParam = currentPath !== '/' && currentPath !== '/login'
                        ? `?redirect=${encodeURIComponent(currentPath)}`
                        : '';
                    window.location.href = `/login${redirectParam}`;
                }
                return Promise.reject(err);
            } finally
            {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
