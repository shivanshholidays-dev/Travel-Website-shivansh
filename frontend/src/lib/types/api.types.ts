export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface ApiError {
    statusCode: number;
    message: string;
    error: string;
}
