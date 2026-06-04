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
    communication_preference?: 'email' | 'sms' | 'whatsapp' | 'none';
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    notes?: string;
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

    updateDonor: async (id: string, data: Partial<DonorCreateRequest>) => {
        return apiV1.put<any>(`/donors/${id}`, data);
    },

    getDonorDonations: async (id: string, params?: any) => {
        return apiV1.get<any>(`/donors/${id}/donations`, { params });
    }
};
