import { apiV1 } from '@/lib/api-v1';

export interface GroupMarriageEvent {
    id: string;
    title: string;
    slug: string;
    description?: string;
    cover_image_url?: string;
    event_type: 'group_marriage';
    location: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    couple_count?: number;
}

export interface GroupMarriageCouple {
    id?: string;
    tenant_id?: string;
    event_id: string;
    couple_number?: number;
    application_date?: string;
    form_number?: string;

    // Groom
    groom_first_name: string;
    groom_last_name?: string;
    groom_dob?: string;
    groom_age?: number;
    groom_phone?: string;
    groom_aadhaar?: string;
    groom_photo_url?: string;
    groom_father_name?: string;
    groom_mother_name?: string;
    groom_guardian_name?: string;
    groom_address?: string;
    groom_city?: string;
    groom_state?: string;
    groom_zipcode?: string;
    groom_country?: string;
    groom_native_address?: string;
    groom_ration_card?: string;
    groom_alternate_phone?: string;
    groom_father_guardian_occupation?: string;
    groom_family_income?: number;
    groom_introduced_by?: string;
    groom_introduced_by_phone?: string;
    groom_religion?: string;
    groom_caste?: string;
    groom_occupation?: string;
    groom_education?: string;

    // Bride
    bride_first_name: string;
    bride_last_name?: string;
    bride_dob?: string;
    bride_age?: number;
    bride_phone?: string;
    bride_aadhaar?: string;
    bride_photo_url?: string;
    bride_father_name?: string;
    bride_mother_name?: string;
    bride_guardian_name?: string;
    bride_address?: string;
    bride_city?: string;
    bride_state?: string;
    bride_zipcode?: string;
    bride_country?: string;
    bride_native_address?: string;
    bride_ration_card?: string;
    bride_alternate_phone?: string;
    bride_father_guardian_occupation?: string;
    bride_family_income?: number;
    bride_introduced_by?: string;
    bride_introduced_by_phone?: string;
    bride_religion?: string;
    bride_caste?: string;
    bride_occupation?: string;
    bride_education?: string;

    notes?: string;
    status?: 'applied' | 'docs_verified' | 'approved' | 'participated' | 'certificate_issued' | 'cancelled';
    event?: { id: string; title: string; start_datetime: string; location?: string };
    documents?: { id: string; doc_type: string; url: string; original_filename?: string; status: string }[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

class GroupMarriageService {
    async listEvents(params?: any): Promise<ApiResponse<GroupMarriageEvent[]>> {
        return apiV1.get<ApiResponse<GroupMarriageEvent[]>>('/group-marriages', { params });
    }

    async registerCouple(eventId: string, data: Partial<GroupMarriageCouple>): Promise<ApiResponse<GroupMarriageCouple>> {
        return apiV1.post<ApiResponse<GroupMarriageCouple>>(`/group-marriages/${eventId}/couples`, data);
    }

    async updateCouple(eventId: string, coupleId: string, data: Partial<GroupMarriageCouple>): Promise<ApiResponse<GroupMarriageCouple>> {
        return apiV1.put<ApiResponse<GroupMarriageCouple>>(`/group-marriages/${eventId}/couples/${coupleId}`, data);
    }

    async addDocument(eventId: string, coupleId: string, data: { doc_type: string; url: string; original_filename?: string }): Promise<ApiResponse<any>> {
        return apiV1.post<ApiResponse<any>>(`/group-marriages/${eventId}/couples/${coupleId}/documents`, data);
    }

    async deleteDocument(eventId: string, coupleId: string, documentId: string): Promise<ApiResponse<any>> {
        return apiV1.delete<ApiResponse<any>>(`/group-marriages/${eventId}/couples/${coupleId}/documents/${documentId}`);
    }

    async getCountries(): Promise<ApiResponse<{ id: string; name: string }[]>> {
        return apiV1.get<ApiResponse<{ id: string; name: string }[]>>('/public/master-data/countries');
    }

    async getStates(countryId: string): Promise<ApiResponse<{ id: string; name: string }[]>> {
        return apiV1.get<ApiResponse<{ id: string; name: string }[]>>(`/public/master-data/states/${countryId}`);
    }

    async lookupPincode(pincode: string): Promise<{ success: boolean; data?: { city: string; state: string; country: string }; error?: string }> {
        return apiV1.get<{ success: boolean; data?: { city: string; state: string; country: string }; error?: string }>(`/public/master-data/pincode/${pincode}`);
    }

    async listAllCouples(params?: any): Promise<ApiResponse<GroupMarriageCouple[]>> {
        return apiV1.get<ApiResponse<GroupMarriageCouple[]>>('/group-marriages/couples', { params });
    }
}

export const groupMarriageService = new GroupMarriageService();
