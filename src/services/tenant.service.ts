import { apiV1 } from '@/lib/api-v1';

export interface Tenant {
    id: string;
    name: string;
    legal_name?: string;
    subdomain: string;
    website?: string;
    logo_url?: string;
    business_type?: 'ngo' | 'charity' | 'foundation' | 'institution';
    country?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    pan_number?: string;
    ngo_80g?: string;
    ngo_12a?: string;
    status?: string;
    currency?: string;
    timezone?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export const tenantService = {
    getTenantInfo: async (): Promise<ApiResponse<Tenant>> => {
        const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
        if (!tenantId) throw new Error('Tenant ID not found');
        return apiV1.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
    },

    updateTenantInfo: async (data: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
        const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
        if (!tenantId) throw new Error('Tenant ID not found');
        // Filter out fields that shouldn't be updated or cause errors
        const { id, created_at, updated_at, ...updateData } = data as any;
        return apiV1.patch<ApiResponse<Tenant>>(`/tenants/${tenantId}`, updateData);
    },

    uploadLogo: async (file: File): Promise<ApiResponse<{ logo_url: string }>> => {
        const formData = new FormData();
        formData.append('file', file);
        return apiV1.upload<ApiResponse<{ logo_url: string }>>('/tenant/logo', formData);
    }
};
