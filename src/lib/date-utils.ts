/**
 * Safely parses a date string from the database, handling PostgreSQL's timestamp format
 * which might include spaces and more than 3 decimal places for microseconds.
 */
export const parseDatabaseDate = (date: string | Date | null | undefined): Date => {
    if (!date) return new Date();

    if (date instanceof Date) {
        return isNaN(date.getTime()) ? new Date() : date;
    }

    try {
        // Standard ISO 8601 strings usually work fine
        let d = new Date(date);
        if (!isNaN(d.getTime())) return d;

        // Handle "YYYY-MM-DD HH:mm:ss.SSSSSS+offset" format
        // 1. Replace space with 'T'
        let formattedStr = date.replace(' ', 'T');

        // 2. Truncate microseconds to milliseconds (JS Date only supports 3 digits)
        formattedStr = formattedStr.replace(/(\.\d{3})\d+/, '$1');

        d = new Date(formattedStr);
        if (!isNaN(d.getTime())) return d;

        // Fallback for Safari and older browsers which are very picky
        // If it still fails, try to remove the timezone and manually parse if needed,
        // but usually the 'T' and millisecond truncation fixes 99% of cases.

        return new Date(date);
    } catch (error) {
        console.error('Error parsing date:', date, error);
        return new Date();
    }
};

/**
 * Formats a database date string into a readable format
 */
export const formatDate = (date: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
}): string => {
    const parsedDate = parseDatabaseDate(date);
    return parsedDate.toLocaleDateString('en-IN', options);
};
