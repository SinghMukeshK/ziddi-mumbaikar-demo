import { apiV1 } from '@/lib/api-v1';

export interface AuditLog {
    id: string;
    tenant_id: string;
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface WebhookEventLog {
    id: string;
    tenant_id: string;
    gateway: string;
    event_type: string;
    gateway_event_id: string;
    payload: any;
    status: 'pending' | 'processed' | 'failed' | 'invalid_signature';
    error_message?: string;
    reference_id?: string;
    created_at: string;
    updated_at: string;
}

export const auditService = {
    getLogs: async (params?: { page?: number, limit?: number }): Promise<PaginatedResponse<AuditLog>> => {
        let query = '';
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        query = searchParams.toString() ? `?${searchParams.toString()}` : '';

        return apiV1.get<PaginatedResponse<AuditLog>>(`/audit-logs${query}`);
    },

    getWebhookLogsByReference: async (referenceId: string) => {
        return apiV1.get<any>(`/audit-logs/webhooks/reference/${referenceId}`);
    }
};
