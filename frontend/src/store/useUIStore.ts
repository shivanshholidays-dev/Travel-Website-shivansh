import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    mobileNavOpen: boolean;
}

interface UIActions {
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleMobileNav: () => void;
    setMobileNavOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
    sidebarOpen: false,
    mobileNavOpen: false,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
    toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
    setMobileNavOpen: (isOpen) => set({ mobileNavOpen: isOpen }),
}));
