import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Shivansh Holidays.in';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
