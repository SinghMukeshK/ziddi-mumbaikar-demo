import { apiV1 } from '@/lib/api-v1';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface VolunteerCreateRequest {
    id?: string;
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    occupation?: string;
    skills?: string[];
    availability?: string;
    address?: string;
    city?: string;
    ward?: string;
    motivation?: string;
    preferred_branch_id?: string;
    id_proof_url?: string;
    photo_url?: string;
    role_interest?: string;
    state?: string;
    zip_code?: string;
    background_check_consent?: boolean;
    documents?: { name: string; url: string; type: string }[];
}

export interface Volunteer {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    gender?: string;
    date_of_birth?: string;
    occupation?: string;
    skills?: string[];
    availability?: string;
    address?: string;
    city?: string;
    ward?: string;
    motivation?: string;
    photo_url?: string;
    id_proof_url?: string;
    status: 'applied' | 'approved' | 'active' | 'inactive' | 'rejected';
    created_at: string;
    role_interest?: string;
    state?: string;
    zip_code?: string;
    background_check_consent?: boolean;
    documents?: { name: string; url: string; type: string }[];
}

class VolunteerService {
    async applyAsVolunteer(data: VolunteerCreateRequest): Promise<ApiResponse<Volunteer>> {
        return apiV1.post<ApiResponse<Volunteer>>('/volunteers/apply', data);
    }

    async getVolunteers(params?: { status?: string; search?: string }): Promise<ApiResponse<Volunteer[]>> {
        return apiV1.get<ApiResponse<Volunteer[]>>('/volunteers', { params });
    }

    async getVolunteer(id: string): Promise<ApiResponse<Volunteer>> {
        return apiV1.get<ApiResponse<Volunteer>>(`/volunteers/${id}`);
    }

    async updateVolunteerStatus(id: string, status: string): Promise<ApiResponse<Volunteer>> {
        return apiV1.patch<ApiResponse<Volunteer>>(`/volunteers/${id}/status`, { status });
    }

    async updateVolunteer(id: string, data: Partial<VolunteerCreateRequest>): Promise<ApiResponse<Volunteer>> {
        return apiV1.put<ApiResponse<Volunteer>>(`/volunteers/${id}`, data);
    }

    async getVolunteerStats(id: string): Promise<ApiResponse<{ total_hours: number; activity_count: number }>> {
        return apiV1.get<ApiResponse<{ total_hours: number; activity_count: number }>>(`/volunteers/${id}/stats`);
    }
}

export const volunteerService = new VolunteerService();
