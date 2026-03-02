import { apiV1 } from '@/lib/api-v1';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    sector: string;
    status: string;
    project_code: string;
    cover_image_url?: string;
}

export const projectService = {
    getProjects: async (params?: any) => {
        return apiV1.get<ApiResponse<Project[]>>('/projects', { params });
    }
};
