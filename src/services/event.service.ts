import { apiV1 } from '@/lib/api-v1';

export interface Event {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_image_url: string;
    event_type: string;
    location: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
}

export interface EventsResponse {
    success: boolean;
    data: Event[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    }
}

class EventService {
    async getEvents(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<EventsResponse> {
        // Because the controller responds directly with { data, meta }, we will treat the returned object as EventsResponse
        return apiV1.get<EventsResponse>('/events', { params });
    }

    async createEvent(data: Partial<Event>): Promise<{ success: boolean; data: Event }> {
        return apiV1.post<{ success: boolean; data: Event }>('/events', data);
    }

    async updateEvent(id: string, data: Partial<Event>): Promise<{ success: boolean; data: Event }> {
        return apiV1.patch<{ success: boolean; data: Event }>(`/events/${id}`, data);
    }

    async deleteEvent(id: string): Promise<{ success: boolean }> {
        return apiV1.delete<{ success: boolean }>(`/events/${id}`);
    }
}

export const eventService = new EventService();
