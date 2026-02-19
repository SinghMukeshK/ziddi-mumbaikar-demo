import { apiV1 } from '@/lib/api-v1';

export interface Donor {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    pan_number?: string;
    donor_type: 'individual' | 'corporate' | 'institution' | 'trust';
    is_anonymous: boolean;
    lifetime_donation_amount: number;
    total_donations: number;
    created_at: string;
}

export interface DonorCreateRequest {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    pan_number?: string;
    donor_type?: 'individual' | 'corporate' | 'institution' | 'trust';
    is_anonymous?: boolean;
}

export const donorService = {
    getDonors: async (params?: any) => {
        return apiV1.get<any>('/donors', { params });
    },

    getDonorById: async (id: string) => {
        return apiV1.get<any>(`/donors/${id}`);
    },

    createDonor: async (data: DonorCreateRequest) => {
        return apiV1.post<any>('/donors', data);
    },

    getDonorDonations: async (id: string, params?: any) => {
        return apiV1.get<any>(`/donors/${id}/donations`, { params });
    }
};
