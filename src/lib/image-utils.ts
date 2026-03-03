export function fixImageUrl(url: string | null | undefined): string {
    if (!url) return '';

    // Trim and handle already absolute URLs
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) return trimmedUrl;

    // Handle S3 protocol
    if (trimmedUrl.startsWith('s3://')) {
        const path = trimmedUrl.replace('s3://', '');
        const firstSlashIndex = path.indexOf('/');
        if (firstSlashIndex !== -1) {
            const bucket = path.substring(0, firstSlashIndex);
            const key = path.substring(firstSlashIndex + 1);

            // Handle specific drista-documents or fallback to standard S3 host
            // Using s3.amazonaws.com as a fallback which usually redirects to the correct region
            const host = bucket === 'drista-documents'
                ? 'drista-documents.s3.us-east-1.amazonaws.com'
                : `${bucket}.s3.amazonaws.com`;

            return `https://${host}/${key}`;
        }
    }

    // Prepend API base URL for relative paths
    // Strip trailing /v1 if present for image paths
    let apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    apiBase = apiBase.replace(/\/v1\/?$/, '');

    if (trimmedUrl.startsWith('/')) {
        return `${apiBase}${trimmedUrl}`;
    }
    return `${apiBase}/${trimmedUrl}`;
}

/**
 * Recursively search and fix image URLs in an object or array.
 * Looks for keys ending in _url or starting with image.
 */
export function fixObjectUrls(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(fixObjectUrls);
    }

    const newObj: any = { ...obj };
    for (const key in newObj) {
        if (typeof newObj[key] === 'string') {
            if (key.endsWith('_url') || key === 'url' || key === 'cover_image' || key === 'image') {
                newObj[key] = fixImageUrl(newObj[key]);
            }
        } else if (typeof newObj[key] === 'object') {
            newObj[key] = fixObjectUrls(newObj[key]);
        }
    }
    return newObj;
}
