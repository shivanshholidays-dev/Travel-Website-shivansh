import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import useAuthStore from '../../store/useAuthStore';

export const useWishlistHooks = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const useWishlist = () => useQuery({
        queryKey: ['wishlist'],
        queryFn: () => wishlistApi.get(),
        enabled: isAuthenticated,
    });

    const useToggleWishlist = () => useMutation({
        mutationFn: (tourId: string) => wishlistApi.toggle(tourId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        }
    });

    return {
        useWishlist,
        useToggleWishlist
    };
};
