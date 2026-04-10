import { apiV1 } from '@/lib/api-v1';
import { fixImageUrl, fixObjectUrls } from '@/lib/image-utils';

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
    current_situation?: string;
    funds_usage?: string;
    beneficiary_story: string;
    cover_image_url: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    donations?: any[];
    name?: string; // Campaigns use name instead of title
    campaign_code?: string;
    project_id?: string;
    beneficiary_id?: string;
    images?: FundraiserImage[];
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
    project_id?: string;
    campaign_code?: string;
    current_situation?: string;
    funds_usage?: string;
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

export const mapCampaignToFundraiser = (campaign: any): Fundraiser => {
    if (!campaign) return campaign;

    const fixImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
        return `${process.env.NEXT_PUBLIC_API_URL}/${url}`;
    };

    return {
        ...campaign,
        id: campaign.id,
        title: campaign.name || campaign.title,
        short_description: campaign.short_description || campaign.description?.substring(0, 160),
        description: campaign.description,
        cover_image_url: fixImageUrl(campaign.cover_image_url),
        images: Array.isArray(campaign.images)
            ? campaign.images.map((img: any) => ({ ...img, image_url: fixImageUrl(img.image_url) }))
            : undefined,
        goal_amount: campaign.goal_amount,
        raised_amount: campaign.raised_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: campaign.status,
        project_id: campaign.project_id,
        completion_percentage: (campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0),
        donor_count: campaign.donor_count || 0,
        current_situation: campaign.current_situation,
        funds_usage: campaign.funds_usage,
        category: campaign.category || { id: 'general', name: 'General' }, // Ensure category is always present
    };
};

export const fundraiserService = {
    getFundraisers: async (params?: any) => {
        // Default to active status if not specified
        const queryParams = { status: 'active', ...params };
        // Try public endpoint first to avoid 401 for non-logged in users
        const response = await apiV1.get<ApiResponse<any[]>>('/public/campaigns', { params: queryParams });
        if (response.success && Array.isArray(response.data)) {
            response.data = response.data.map(mapCampaignToFundraiser);
        }
        return response as ApiResponse<Fundraiser[]>;
    },

    getFundraiserById: async (id: string) => {
        // Try public campaign endpoint first
        try {
            const response = await apiV1.get<ApiResponse<any>>(`/public/campaigns/${id}`);
            if (response.success && response.data) {
                response.data = mapCampaignToFundraiser(response.data);
                return response as ApiResponse<Fundraiser>;
            }
        } catch (err) {
            // If campaign not found, fall back to fundraiser
            console.log(`Campaign ${id} not found, trying fundraiser`);
        }

        return apiV1.get<ApiResponse<Fundraiser>>(`/public/fundraisers/${id}`);
    },

    createFundraiser: async (data: FundraiserCreateRequest) => {
        // Map FundraiserCreateRequest to CampaignCreateRequest if needed
        const campaignData = {
            ...data,
            name: data.title,
            // Generate campaign_code if not provided
            campaign_code: data.campaign_code || `FND-${Date.now()}`,
            // Ensure project_id is present (defaulting for now if missing)
            project_id: data.project_id || '00000000-0000-0000-0000-000000000000',
            current_situation: data.current_situation,
            funds_usage: data.funds_usage,
        };
        return apiV1.post<ApiResponse<any>>('/campaigns', campaignData);
    },

    updateFundraiser: async (id: string, data: Partial<FundraiserCreateRequest>) => {
        const campaignData = {
            ...data,
            name: data.title,
        };
        return apiV1.patch<ApiResponse<any>>(`/campaigns/${id}`, campaignData);
    },

    deleteFundraiser: async (id: string) => {
        return apiV1.delete<ApiResponse<any>>(`/campaigns/${id}`);
    },

    addFundraiserImages: async (fundraiserId: string, data: { image_url: string; alt_text?: string; display_order?: number }) => {
        return apiV1.post<ApiResponse<any>>(`/campaigns/${fundraiserId}/images`, data);
    },

    addFundraiserDocuments: async (fundraiserId: string, data: { document_type: string; file_url: string; file_name: string }) => {
        return apiV1.post<ApiResponse<any>>(`/campaigns/${fundraiserId}/documents`, data);
    },

    deleteFundraiserImage: async (fundraiserId: string, imageId: string) => {
        return apiV1.delete<ApiResponse<any>>(`/campaigns/${fundraiserId}/images/${imageId}`);
    },

    deleteFundraiserDocument: async (fundraiserId: string, documentId: string) => {
        return apiV1.delete<ApiResponse<any>>(`/campaigns/${fundraiserId}/documents/${documentId}`);
    },

    // Note: Updates might be different for campaigns, checking if they exist
    addFundraiserUpdate: async (fundraiserId: string, update: { title: string, content: string }) => {
        return apiV1.post<ApiResponse<any>>(`/campaigns/${fundraiserId}/updates`, update);
    },

    uploadMedia: async (file: File, module: string = 'common', id?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        const endpoint = id ? `/upload/${module}/${id}` : `/upload/${module}`;
        return apiV1.upload<ApiResponse<{ url: string }>>(endpoint, formData);
    },

    getFundraiserStats: async (id: string) => {
        try {
            const response = await apiV1.get<ApiResponse<FundraiserStats>>(`/public/campaigns/${id}/stats`);
            if (response.success) return response;
        } catch (err) {
            // Fallback
        }
        return apiV1.get<ApiResponse<FundraiserStats>>(`/public/fundraisers/${id}/stats`).catch(() =>
            apiV1.get<ApiResponse<FundraiserStats>>(`/fundraisers/stats/${id}`));
    },

    getFundraiserExtensions: async (id: string) => {
        try {
            const response = await apiV1.get<ApiResponse<FundraiserExtensions>>(`/public/campaigns/${id}/extensions`);
            if (response.success && response.data) {
                response.data = fixObjectUrls(response.data);
                return response;
            }
        } catch (err) {
            // Fallback
        }
        const response = await apiV1.get<ApiResponse<FundraiserExtensions>>(`/public/fundraisers/${id}/extensions`);
        if (response.success && response.data) {
            response.data = fixObjectUrls(response.data);
        }
        return response;
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
        const response = await apiV1.get<ApiResponse<any[]>>('/campaigns', { params: { status: 'pending_approval' } });
        if (response.success && Array.isArray(response.data)) {
            response.data = response.data.map(mapCampaignToFundraiser);
        }
        return response as ApiResponse<Fundraiser[]>;
    },

    verifyFundraiser: async (id: string, status: 'active' | 'rejected', rejectionReason?: string) => {
        // Since campaigns don't have a separate verify endpoint/status, we update the status directly
        return apiV1.patch<ApiResponse<any>>(`/campaigns/${id}`, {
            status: status,
            rejection_reason: rejectionReason
        });
    },

    cancelFundraiser: async (id: string) => {
        return apiV1.patch<ApiResponse<any>>(`/campaigns/${id}`, { status: 'cancelled' });
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
