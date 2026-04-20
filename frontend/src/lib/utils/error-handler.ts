/**
 * Centralized utility to extract user-friendly error messages from API responses.
 * Handles AxiosError structures, validation arrays, and nested message objects.
 */
export const getErrorMessage = (error: any, fallback: string = 'Verification failed. Please try again.'): string => {
    if (!error) return fallback;

    // 1. Check for Axios error response data
    const responseData = error.response?.data;

    if (responseData)
    {
        // Handle NestJS typical error response: { message: string | string[], error: string, statusCode: number }
        const message = responseData.message || responseData.error;

        if (Array.isArray(message))
        {
            // Join validation errors (e.g., ["email must be an email", "password too short"])
            return message[0]; // Usually the first one is enough for a toast
        }

        if (typeof message === 'string')
        {
            return message;
        }
    }

    // 2. Check for error.message (Axios internal or JS Error)
    if (error.message && typeof error.message === 'string')
    {
        // Skip generic "Network Error" if we have a fallback
        if (error.message === 'Network Error') return 'Network connectivity issue. Please check your connection.';
        return error.message;
    }

    return fallback;
};
