import { apiV1 } from '@/lib/api-v1';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

/** A single media item (image/video/document stored in the media library) */
export interface MediaItem {
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;       // 'image' | 'video' | 'document' | etc.
    mime_type?: string;
    file_size?: number;
    alt_text?: string;
    caption?: string;
    tags?: string[];
    uploaded_by?: string;
    created_at: string;
    updated_at?: string;
}

/** A gallery album (collection of media items) */
export interface GalleryAlbum {
    id: string;
    title: string;
    description?: string;
    cover_image_id?: string;
    cover_image_url?: string;
    slug?: string;
    is_published: boolean;
    display_order?: number;
    media_count?: number;
    created_at: string;
    updated_at?: string;
}

/** A media item inside a gallery album (join table row) */
export interface GalleryAlbumMedia {
    id: string;
    album_id: string;
    media_id: string;
    display_order?: number;
    caption?: string;
    media?: MediaItem;       // populated when fetched with relations
}

// ── Caching Utilities ────────────────────────────────────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'gallery_api_';

function getCached<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const item = sessionStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            if (Date.now() - parsed.timestamp < CACHE_TTL) {
                return parsed.data;
            }
        }
    } catch { }
    return null;
}

function setCache(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { }
}

function invalidateCache() {
    if (typeof window === 'undefined') return;
    try {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch { }
}

// ── Service ──────────────────────────────────────────────────────────────────

export const galleryService = {

    // ── Media library ────────────────────────────────────────────────────────

    /** List all media items (supports ?file_type=image etc.) */
    getMedia: async (params?: { file_type?: string; page?: number; limit?: number }) => {
        return apiV1.get<ApiResponse<MediaItem[]>>('/media', { params: params as any });
    },

    /** Get a single media item */
    getMediaById: async (id: string) => {
        return apiV1.get<ApiResponse<MediaItem>>(`/media/${id}`);
    },

    /** Upload a new media file */
    uploadMedia: async (file: File, altText?: string, caption?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (altText) formData.append('alt_text', altText);
        if (caption) formData.append('caption', caption);
        return apiV1.upload<ApiResponse<MediaItem>>('/media', formData);
    },

    /** Update media metadata (alt_text, caption, tags) */
    updateMedia: async (id: string, data: Partial<Pick<MediaItem, 'alt_text' | 'caption' | 'tags'>>) => {
        return apiV1.patch<ApiResponse<MediaItem>>(`/media/${id}`, data);
    },

    /** Delete a media item */
    deleteMedia: async (id: string) => {
        invalidateCache();
        return apiV1.delete<ApiResponse<any>>(`/media/${id}`);
    },

    // ── Gallery Albums ────────────────────────────────────────────────────────

    /** List all albums */
    getAlbums: async (params?: { is_published?: boolean; page?: number; limit?: number }) => {
        const cacheKey = `${CACHE_PREFIX}albums_${JSON.stringify(params || {})}`;
        const cached = getCached<ApiResponse<GalleryAlbum[]>>(cacheKey);
        if (cached) return Promise.resolve(cached);

        const res = await apiV1.get<ApiResponse<GalleryAlbum[]>>('/gallery/albums', { params: params as any });
        setCache(cacheKey, res);
        return res;
    },

    /** Get a single album */
    getAlbumById: async (id: string) => {
        const cacheKey = `${CACHE_PREFIX}album_${id}`;
        const cached = getCached<ApiResponse<GalleryAlbum>>(cacheKey);
        if (cached) return Promise.resolve(cached);

        const res = await apiV1.get<ApiResponse<GalleryAlbum>>(`/gallery/albums/${id}`);
        setCache(cacheKey, res);
        return res;
    },

    createAlbum: async (data: {
        title: string;
        description?: string;
        cover_image_id?: string;
        cover_image_url?: string;
        slug?: string;
        is_published?: boolean;
        display_order?: number;
    }) => {
        const payload = {
            title: data.title || '',
            description: data.description || null,
            cover_image_id: data.cover_image_id || null,
            cover_image_url: data.cover_image_url || null,
            is_published: data.is_published ?? true,
            display_order: data.display_order ?? 0,
        };
        const res = await apiV1.post<ApiResponse<GalleryAlbum>>('/gallery/albums', payload);
        invalidateCache();
        return res;
    },

    updateAlbum: async (id: string, data: Partial<{
        title: string;
        description: string;
        cover_image_id: string;
        cover_image_url: string;
        slug: string;
        is_published: boolean;
        display_order: number;
    }>) => {
        const res = await apiV1.patch<ApiResponse<GalleryAlbum>>(`/gallery/albums/${id}`, data);
        invalidateCache();
        return res;
    },

    /** Delete an album */
    deleteAlbum: async (id: string) => {
        const res = await apiV1.delete<ApiResponse<any>>(`/gallery/albums/${id}`);
        invalidateCache();
        return res;
    },

    // ── Gallery Album Media ───────────────────────────────────────────────────

    /** List all media in an album */
    getAlbumMedia: async (albumId: string) => {
        const cacheKey = `${CACHE_PREFIX}album_media_${albumId}`;
        const cached = getCached<ApiResponse<GalleryAlbumMedia[]>>(cacheKey);
        if (cached) return Promise.resolve(cached);

        const res = await apiV1.get<ApiResponse<GalleryAlbumMedia[]>>(`/gallery/albums/${albumId}/media`);
        setCache(cacheKey, res);
        return res;
    },

    /** Add a media item to an album */
    addMediaToAlbum: async (albumId: string, data: {
        media_id: string;
        display_order?: number;
        caption?: string;
    }) => {
        const res = await apiV1.post<ApiResponse<GalleryAlbumMedia>>(`/gallery/albums/${albumId}/media`, data);
        invalidateCache();
        return res;
    },

    updateAlbumMedia: async (albumId: string, albumMediaId: string, data: {
        display_order?: number;
        caption?: string;
    }) => {
        const res = await apiV1.patch<ApiResponse<GalleryAlbumMedia>>(
            `/gallery/albums/${albumId}/media/${albumMediaId}`,
            data
        );
        invalidateCache();
        return res;
    },

    /** Remove a media item from an album */
    removeMediaFromAlbum: async (albumId: string, albumMediaId: string) => {
        const res = await apiV1.delete<ApiResponse<any>>(`/gallery/albums/${albumId}/media/${albumMediaId}`);
        invalidateCache();
        return res;
    },

    /** Convenience: upload a file and immediately add it to an album */
    uploadAndAddToAlbum: async (
        albumId: string,
        file: File,
        altText?: string,
        caption?: string,
        displayOrder?: number
    ) => {
        // 1. Upload to media library
        const uploadRes = await galleryService.uploadMedia(file, altText, caption);
        if (!uploadRes.success || !uploadRes.data?.id) {
            throw new Error('Media upload failed');
        }
        // 2. Add to album
        return galleryService.addMediaToAlbum(albumId, {
            media_id: uploadRes.data.id,
            display_order: displayOrder,
            caption,
        });
    },
};
