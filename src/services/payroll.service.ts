import { apiV1 } from '@/lib/api-v1';
import { ApiResponse } from './volunteer.service';

export interface Designation {
    id: string;
    name: string;
    description?: string;
    status?: string;
}

class PayrollService {
    async getDesignations(): Promise<ApiResponse<Designation[]>> {
        return apiV1.get<ApiResponse<Designation[]>>('/payroll/designations');
    }
}

export const payrollService = new PayrollService();
