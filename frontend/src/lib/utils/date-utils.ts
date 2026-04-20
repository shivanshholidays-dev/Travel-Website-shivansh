import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Kolkata';

/**
 * Global Frontend Date Utilities guaranteeing strictly safe IST rendering
 * mitigating any browser local timezone shifting.
 */
export const DateUtils = {
    /**
     * Accepts any absolute DB (UTC) DateTime and locks it into IST format.
     * Prevents timeline drifting for users in US/Europe formatting Indian trips.
     */
    formatToIST(dateObjOrString: Date | string | number | null | undefined, formatString: string = 'DD MMM YYYY'): string {
        if (!dateObjOrString) return '';
        return dayjs(dateObjOrString).tz(TIMEZONE).format(formatString);
    },

    /**
     * Renders an absolute DB (UTC) Date into "YYYY-MM-DD" string
     * required identically by <input type="date" /> in the admin forms, safely locked to IST timezone.
     */
    formatDateForInput(utcDate: Date | string | null | undefined): string {
        if (!utcDate) return '';
        return dayjs(utcDate).tz(TIMEZONE).format('YYYY-MM-DD');
    },

    /**
     * Converts a local string to absolute UTC prior to issuing API saving requests.
     */
    parseLocalToUTC(localDateStr: string): string {
        return dayjs.tz(localDateStr, 'YYYY-MM-DD', TIMEZONE).utc().toISOString();
    },

    /**
     * Computes the "time ago" string relative to IST now.
     */
    timeAgoIST(dateObjOrString: Date | string | number): string {
        if (!dateObjOrString) return '';
        const target = dayjs(dateObjOrString).tz(TIMEZONE);
        const now = dayjs().tz(TIMEZONE);

        const diffInSeconds = now.diff(target, 'second');
        const diffInMinutes = now.diff(target, 'minute');
        const diffInHours = now.diff(target, 'hour');
        const diffInDays = now.diff(target, 'day');

        if (diffInSeconds < 60) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        return target.format('DD MMM YYYY');
    }
};
