import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@lib/constants/enums';

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole | string;
    avatar?: string;
    profileImage?: string; // KEEP for backward compatibility until all components migrated
    isVerified: boolean;
    isBlocked: boolean;
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;
}

interface AuthActions {
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: AuthUser) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setHydrated: () => void;
}

const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            // State
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: false,

            // Actions
            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken, isAuthenticated: true }),

            setUser: (userData: any) => {
                // Safely extract the nested data object if the backend wrapped it
                const normalizedUser = userData?.data ? userData.data : userData;

                // Ensure profileImage is synced for legacy components
                if (normalizedUser.avatar && !normalizedUser.profileImage)
                {
                    normalizedUser.profileImage = normalizedUser.avatar;
                } else if (normalizedUser.profileImage && !normalizedUser.avatar)
                {
                    normalizedUser.avatar = normalizedUser.profileImage;
                }

                set({ user: normalizedUser, isAuthenticated: true });
            },

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            setLoading: (isLoading) => set({ isLoading }),
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'auth-storage',
            // Only persist tokens – re-fetch user on mount
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
                user: state.user,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);

export default useAuthStore;
