import { MetadataRoute } from 'next';
import { toursApi } from '../src/lib/api/tours.api';
import { blogsApi } from '../src/lib/api/blogs.api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Shivansh Holidays.in';

    // Static routes
    const routes = [
        '',
        '/tours/grid',
        '/about',
        '/contact',
        '/team',
        '/blog',
        '/custom-tour',
        '/careers',
        '/booking-instructions',
        '/terms-and-conditions',
        '/privacy-policy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    try
    {
        // Dynamic tour routes
        const toursRes = await toursApi.getAll({ limit: 100 });
        const tourEntries = (toursRes as any)?.items?.map((tour: any) => ({
            url: `${baseUrl}/tours/${tour.slug}`,
            lastModified: new Date(tour.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        })) || [];

        // Dynamic blog routes
        const blogsRes = await blogsApi.getAll({ limit: 100 });
        const blogEntries = (blogsRes as any)?.items?.map((blog: any) => ({
            url: `${baseUrl}/blog/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })) || [];

        return [...routes, ...tourEntries, ...blogEntries];
    } catch (error)
    {
        console.error('Sitemap generation error:', error);
        return routes;
    }
}
