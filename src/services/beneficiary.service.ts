import { apiV1 } from '@/lib/api-v1';
import { ApiResponse } from '@/services/volunteer.service';

export interface BeneficiaryCreateRequest {
    full_name: string;
    phone: string;
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    aid_type: string;
    case_description: string;
    branch_id?: string;
}

export interface Beneficiary {
    id: string;
    full_name: string;
    phone: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    created_at: string;
}

class BeneficiaryService {
    async createBeneficiary(data: BeneficiaryCreateRequest): Promise<ApiResponse<Beneficiary>> {
        return apiV1.post<ApiResponse<Beneficiary>>('/beneficiaries', data);
    }
}

export const beneficiaryService = new BeneficiaryService();
