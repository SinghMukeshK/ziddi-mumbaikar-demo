import { apiV1 } from '@/lib/api-v1';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface NgoService {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    status: 'active' | 'inactive';
    is_free: boolean;
    display_order: number;
}

export interface NgoServiceBooking {
    id: string;
    service_id: string;
    user_id?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    pickup_address?: string;
    drop_address?: string;
    booking_date: string;
    booking_time?: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    donation_id?: string;
    age?: number;
    gender?: string;
    reference_name?: string;
    reference_number?: string;
}

export interface BookingRequest {
    service_id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    pickup_address?: string;
    drop_address?: string;
    booking_date: string;
    booking_time?: string;
    notes?: string;
    donation_amount?: number;
    age?: number;
    gender?: string;
    reference_name?: string;
    reference_number?: string;
}

export const ngoService = {
    getServices: async (): Promise<ApiResponse<NgoService[]>> => {
        return apiV1.get<ApiResponse<NgoService[]>>('/services');
    },

    createService: async (data: Partial<NgoService>): Promise<ApiResponse<NgoService>> => {
        return apiV1.post<ApiResponse<NgoService>>('/services', data);
    },

    bookService: async (data: BookingRequest): Promise<ApiResponse<NgoServiceBooking>> => {
        return apiV1.post<ApiResponse<NgoServiceBooking>>('/services/book', data);
    },

    getBookings: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<NgoServiceBooking[]>> => {
        return apiV1.get<ApiResponse<NgoServiceBooking[]>>('/services/bookings', { params });
    },

    updateBookingStatus: async (id: string, status: string): Promise<ApiResponse<NgoServiceBooking>> => {
        return apiV1.patch<ApiResponse<NgoServiceBooking>>(`/services/bookings/${id}/status`, { status });
    },

    updateBookingDonation: async (id: string, donationId: string): Promise<ApiResponse<NgoServiceBooking>> => {
        return apiV1.patch<ApiResponse<NgoServiceBooking>>(`/services/bookings/${id}/donation`, { donation_id: donationId });
    }
};
