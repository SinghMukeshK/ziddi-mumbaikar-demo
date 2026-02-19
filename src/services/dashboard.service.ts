import { apiV1 } from '@/lib/api-v1';

export interface DashboardStats {
    activeFundraisers: number;
    totalRaised: number;
    totalDonations: number;
    totalDonors: number;
    totalVolunteers: number;
}

export interface RecentActivity {
    recentFundraisers: any[];
    recentDonations: any[];
}

export const dashboardService = {
    getStats: async () => {
        return apiV1.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    },

    getRecentActivity: async () => {
        return apiV1.get<{ success: boolean; data: RecentActivity }>('/dashboard/recent-activity');
    }
};
