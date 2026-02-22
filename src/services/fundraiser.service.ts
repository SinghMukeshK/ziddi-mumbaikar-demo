import { apiV1 } from '@/lib/api-v1';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Fundraiser {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    category: {
        id: string;
        name: string;
    };
    goal_amount: number;
    raised_amount: number;
    donor_count: number;
    completion_percentage: number;
    currency: string;
    status: string;
    is_featured: boolean;
    is_urgent: boolean;
    is_zakat_eligible: boolean;
    is_sadaqah_eligible: boolean;
    is_lillah_eligible: boolean;
    is_interest_eligible: boolean;
    start_date: string;
    end_date: string;
    beneficiary_name: string;
    beneficiary_story: string;
    cover_image_url: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    donations?: any[];
}

export interface FundraiserImage {
    id: string;
    image_url: string;
    alt_text: string;
    display_order: number;
}

export interface FundraiserUpdate {
    id: string;
    title: string;
    content: string;
    posted_by: string;
    created_at: string;
}

export interface FundraiserDocument {
    id: string;
    document_type: string;
    file_url: string;
    file_name: string;
}

export interface FundraiserExtensions {
    images: FundraiserImage[];
    updates: FundraiserUpdate[];
    documents: FundraiserDocument[];
}

export interface FundraiserStats {
    total_raised: number;
    total_donations: number;
    goal_percentage: number;
}

export interface FundraiserCreateRequest {
    title: string;
    slug?: string;
    short_description?: string;
    description: string;
    goal_amount: number;
    category_id: string;
    beneficiary_id?: string;
    beneficiary_name?: string;
    beneficiary_story?: string;
    cover_image_url?: string;
    is_zakat_eligible?: boolean;
    is_sadaqah_eligible?: boolean;
    is_lillah_eligible?: boolean;
    is_interest_eligible?: boolean;
    start_date?: string;
    end_date?: string;
    branch_id?: string;
    tags?: string[];
    status?: string;
    is_urgent?: boolean;
    is_featured?: boolean;
}

export interface FundraiserCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    display_order: number;
}

let categoriesCache: FundraiserCategory[] | null = null;

export const fundraiserService = {
    getFundraisers: async (params?: any) => {
        return apiV1.get<ApiResponse<Fundraiser[]>>('/fundraisers', { params });
    },

    getFundraiserById: async (id: string) => {
        return apiV1.get<ApiResponse<Fundraiser>>(`/fundraisers/${id}`);
    },

    createFundraiser: async (data: FundraiserCreateRequest) => {
        return apiV1.post<ApiResponse<Fundraiser>>('/fundraisers', data);
    },

    updateFundraiser: async (id: string, data: Partial<FundraiserCreateRequest>) => {
        return apiV1.patch<ApiResponse<Fundraiser>>(`/fundraisers/${id}`, data);
    },

    deleteFundraiser: async (id: string) => {
        return apiV1.delete<ApiResponse<any>>(`/fundraisers/${id}`);
    },


    addFundraiserImages: async (fundraiserId: string, data: { image_url: string; alt_text?: string; display_order?: number }) => {
        return apiV1.post<ApiResponse<any>>(`/fundraisers/${fundraiserId}/images`, data);
    },

    addFundraiserDocuments: async (fundraiserId: string, data: { document_type: string; file_url: string; file_name: string }) => {
        return apiV1.post<ApiResponse<any>>(`/fundraisers/${fundraiserId}/documents`, data);
    },

    deleteFundraiserImage: async (fundraiserId: string, imageId: string) => {
        return apiV1.delete<ApiResponse<any>>(`/fundraisers/${fundraiserId}/images/${imageId}`);
    },

    deleteFundraiserDocument: async (fundraiserId: string, documentId: string) => {
        return apiV1.delete<ApiResponse<any>>(`/fundraisers/${fundraiserId}/documents/${documentId}`);
    },

    addFundraiserUpdate: async (fundraiserId: string, update: { title: string, content: string }) => {
        return apiV1.post<ApiResponse<any>>(`/fundraisers/${fundraiserId}/updates`, update);
    },

    uploadMedia: async (file: File, module: string = 'common', id?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        const endpoint = id ? `/upload/${module}/${id}` : `/upload/${module}`;
        return apiV1.upload<ApiResponse<{ url: string }>>(endpoint, formData);
    },

    getFundraiserStats: async (id: string) => {
        return apiV1.get<ApiResponse<FundraiserStats>>(`/fundraisers/stats/${id}`);
    },

    getFundraiserExtensions: async (id: string) => {
        return apiV1.get<ApiResponse<FundraiserExtensions>>(`/fundraisers/${id}/extensions`);
    },

    getCategories: async (): Promise<ApiResponse<FundraiserCategory[]>> => {
        // Try in-memory cache first
        if (categoriesCache) {
            return { success: true, data: categoriesCache };
        }

        // Try localStorage cache
        if (typeof window !== 'undefined') {
            const cachedData = localStorage.getItem('fundraiser_categories');
            const cacheTimestamp = localStorage.getItem('fundraiser_categories_timestamp');
            const tenantId = localStorage.getItem('tenant_id');
            const cachedTenantId = localStorage.getItem('fundraiser_categories_tenant_id');

            // Cache is valid for 1 hour and matches the current tenant
            if (cachedData && cacheTimestamp && tenantId === cachedTenantId) {
                const now = Date.now();
                if (now - parseInt(cacheTimestamp) < 3600000) { // 1 hour
                    const parsed = JSON.parse(cachedData);
                    categoriesCache = parsed;
                    return { success: true, data: parsed };
                }
            }
        }

        const response = await apiV1.get<ApiResponse<FundraiserCategory[]>>('/public/categories');
        if (response.success && response.data) {
            categoriesCache = response.data;
            if (typeof window !== 'undefined') {
                localStorage.setItem('fundraiser_categories', JSON.stringify(response.data));
                localStorage.setItem('fundraiser_categories_timestamp', Date.now().toString());
                localStorage.setItem('fundraiser_categories_tenant_id', localStorage.getItem('tenant_id') || '');
            }
        }
        return response;
    },

    getPendingFundraisers: async () => {
        return apiV1.get<ApiResponse<Fundraiser[]>>('/fundraisers', { params: { status: 'pending' } });
    },

    verifyFundraiser: async (id: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
        return apiV1.post<ApiResponse<Fundraiser>>(`/fundraisers/${id}/verify`, {
            verification_status: status,
            rejection_reason: rejectionReason
        });
    },

    cancelFundraiser: async (id: string) => {
        return apiV1.patch<ApiResponse<Fundraiser>>(`/fundraisers/${id}`, { status: 'cancelled' });
    },


    clearCategoriesCache: () => {
        categoriesCache = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('fundraiser_categories');
            localStorage.removeItem('fundraiser_categories_timestamp');
            localStorage.removeItem('fundraiser_categories_tenant_id');
        }
    }
};
