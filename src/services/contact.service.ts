import { apiV1 } from '@/lib/api-v1';

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    inquiryType: string;
}

export const contactService = {
    submitInquiry: async (data: ContactFormData) => {
        return apiV1.post<{ success: boolean; message: string }>('/contact/submit', data);
    },

    // Admin methods
    getInquiries: async (params?: { page?: number; limit?: number; status?: string }) => {
        return apiV1.get<{ success: boolean; data: any[]; pagination: any }>('/contact/inquiries', { params });
    },

    updateInquiry: async (id: string, data: { status: string; notes?: string }) => {
        return apiV1.patch<{ success: boolean; data: any }>(`/contact/inquiries/${id}`, data);
    }
};
