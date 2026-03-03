import { apiV1 } from '@/lib/api-v1';

export interface Notification {
    id: string;
    recipient: string;
    status: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    template?: {
        subject: string;
        content: string;
        slug: string;
    };
    template_vars: any;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export const notificationService = {
    getMyNotifications: async (params?: { page?: number, limit?: number, is_read?: boolean }): Promise<PaginatedResponse<Notification>> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.is_read !== undefined) searchParams.append('is_read', params.is_read.toString());

        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return apiV1.get<PaginatedResponse<Notification>>(`/notifications/me${query}`);
    },

    getUnreadCount: async (): Promise<{ success: boolean, data: { unread_count: number } }> => {
        return apiV1.get<{ success: boolean, data: { unread_count: number } }>('/notifications/unread-count');
    },

    markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
        return apiV1.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
    },

    markAllAsRead: async (): Promise<ApiResponse<null>> => {
        return apiV1.patch<ApiResponse<null>>('/notifications/mark-all-read', {});
    }
};
