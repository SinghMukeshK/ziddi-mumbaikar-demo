export function fixImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('s3://')) {
        const path = url.replace('s3://', '');
        const firstSlashIndex = path.indexOf('/');
        if (firstSlashIndex !== -1) {
            const bucket = path.substring(0, firstSlashIndex);
            const key = path.substring(firstSlashIndex + 1);
            // Handle specific drista-documents host or fallback to standard S3
            if (bucket === 'drista-documents') {
                return `https://drista-documents/${key}`;
            }
            return `https://${bucket}.s3.amazonaws.com/${key}`;
        }
    }
    return url;
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
