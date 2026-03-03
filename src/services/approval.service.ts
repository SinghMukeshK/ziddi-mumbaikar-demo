import { apiV1 } from '@/lib/api-v1';

export interface ApprovalRequest {
    id: string;
    tenant_id: string;
    entity_type: string;
    entity_id: string;
    title: string;
    summary: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requested_by: string;
    created_at: string;
    updated_at: string;
    requester?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
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

export const approvalService = {
    getPendingApprovals: async (params?: { page?: number, limit?: number, entity_type?: string }): Promise<PaginatedResponse<ApprovalRequest>> => {
        let query = '?status=pending';
        if (params?.page) query += `&page=${params.page}`;
        if (params?.limit) query += `&limit=${params.limit}`;
        if (params?.entity_type) query += `&entity_type=${params.entity_type}`;

        return apiV1.get<PaginatedResponse<ApprovalRequest>>(`/approvals${query}`);
    },

    getApprovalDetails: async (id: string): Promise<ApiResponse<ApprovalRequest>> => {
        return apiV1.get<ApiResponse<ApprovalRequest>>(`/approvals/${id}`);
    },

    processDecision: async (id: string, decision: 'approved' | 'rejected', comments: string = ''): Promise<ApiResponse<ApprovalRequest>> => {
        return apiV1.patch<ApiResponse<ApprovalRequest>>(`/approvals/${id}/decide`, { decision, comments });
    }
};
