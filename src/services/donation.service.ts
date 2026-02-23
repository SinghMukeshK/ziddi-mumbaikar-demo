import { apiV1 } from '@/lib/api-v1';

export interface Donation {
    id: string;
    tenant_id: string;
    donation_number: string;
    donor_id: string;
    amount: number;
    currency: string;
    donation_type: 'general' | 'zakat' | 'sadaqah' | 'fitrah' | 'qurbani';
    payment_method: 'upi' | 'card' | 'net_banking' | 'wallet' | 'bank_transfer' | 'cash' | 'cheque';
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    is_anonymous: boolean;
    transaction_id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    created_at: string;
    updated_at: string;
}

export interface DonationCreateRequest {
    fundraiser_id: string;
    donor_id?: string;
    amount: number;
    donation_type?: 'general' | 'zakat' | 'sadaqah' | 'fitrah' | 'qurbani';
    payment_method: 'upi' | 'card' | 'net_banking' | 'wallet' | 'bank_transfer' | 'cash' | 'cheque';
    donor_name?: string;
    donor_email?: string;
    donor_phone?: string;
    donor_pan?: string;
    is_anonymous?: boolean;
    message?: string;
    payment_gateway?: string;
}

export interface RazorpayOrderRequest {
    fundraiser_id?: string;
    amount: number;
    currency?: string;
    donor_name?: string;
    donor_email?: string;
    donor_phone?: string;
    donor_pan?: string;
    is_anonymous?: boolean;
    donation_type?: string;
    message?: string;
}

export interface RazorpayOrderResponse {
    donation_id: string;
    razorpay_order_id: string;
    amount: number;       // in paise
    currency: string;
    key_id: string;
}

export interface PaymentVerificationRequest {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export const donationService = {
    getDonations: async (params?: any) => {
        return apiV1.get<any>('/donations', { params });
    },

    getDonationById: async (id: string) => {
        return apiV1.get<any>(`/donations/${id}`);
    },

    createDonation: async (data: DonationCreateRequest) => {
        return apiV1.post<any>('/donations', data);
    },

    /**
     * Create a Razorpay order on the backend.
     * Returns the Razorpay order_id, amount (paise), currency, and key_id
     * needed to open the Razorpay checkout popup.
     */
    createRazorpayOrder: async (data: RazorpayOrderRequest) => {
        return apiV1.post<{ success: boolean; data: RazorpayOrderResponse }>(
            '/donations/razorpay/create-order',
            data
        );
    },

    /**
     * Verify the Razorpay payment signature on the backend after
     * the user completes payment in the Razorpay popup.
     */
    verifyPayment: async (donationId: string, data: PaymentVerificationRequest) => {
        return apiV1.post<any>(`/donations/${donationId}/verify`, data);
    },
};
