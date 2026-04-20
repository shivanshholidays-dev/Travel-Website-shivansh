/**
 * Universal Currency Utilities for INR (₹) standardization
 */

/**
 * Formats a number into an Indian Rupee string (e.g., ₹1,23,456.78)
 * @param amount The numerical value to format
 * @param includeDecimals Whether to show paisa (default: true)
 */
export const formatCurrency = (amount: number | string | undefined | null, includeDecimals: boolean = true): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (value === undefined || value === null || isNaN(value))
    {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: includeDecimals ? 2 : 0,
        maximumFractionDigits: includeDecimals ? 2 : 0,
    }).format(value);
};
