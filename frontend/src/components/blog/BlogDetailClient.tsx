'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useBlogHooks } from '../../lib/hooks/useBlogHooks';
import { Blog } from '../../lib/types/blog.types';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { BlogDetailSkeleton } from '../../components/common/SkeletonLoader';
import { DateUtils } from '../../lib/utils/date-utils';
import SafeImage from '../../components/common/SafeImage';

const FALLBACK_IMAGE = '/assets/img/blog/blog-details/details-thumb-2.jpg';


const CalendarSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M10.875 2.25V0.75M4.125 2.25V0.75M0.9375 4.5H14.0625M7.5 14.25C4.31802 14.25 2.72703 14.25 1.73851 13.2615C0.75 12.273 0.75 10.682 0.75 7.5C0.75 4.31802 0.75 3.47703 1.73851 2.48851C2.72703 1.5 4.31802 1.5 7.5 1.5C10.682 1.5 12.273 1.5 13.2615 2.48851C14.25 3.47703 14.25 4.31802 14.25 7.5C14.25 10.682 14.25 12.273 13.2615 13.2615C12.273 14.25 10.682 14.25 7.5 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function formatDate(dateStr?: string): string {
    return DateUtils.formatToIST(dateStr, 'MMMM DD, YYYY');
}

/** Safely unwrap the blog from API response - handles both wrapped & unwrapped shapes */
function unwrapBlog(raw: unknown): Blog | null {
    if (!raw) return null;
    const r = raw as Record<string, unknown>;
    // If it has a 'title' it's already a blog object
    if (r.title) return r as unknown as Blog;
    // If it's wrapped: { data: Blog }
    if (r.data && typeof r.data === 'object' && (r.data as Record<string, unknown>).title)
    {
        return r.data as unknown as Blog;
    }
    return null;
}

interface Props {
    slug: string;
}

export default function BlogDetailClient({ slug }: Props) {
    const { useBlogBySlug, useBlogsList } = useBlogHooks();

    // Main blog fetch
    const { data: rawBlog, isLoading, error } = useBlogBySlug(slug);

    // ONE shared list call for sidebar (recent + categories) and related articles
    // staleTime prevents refetches when navigating between blog posts
    const { data: sidebarData } = useBlogsList({ limit: 10, page: 1 });

    const [sanitizedContent, setSanitizedContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pageUrl, setPageUrl] = useState('');

    // Safely unwrap the blog object
    const blog: Blog | null = useMemo(() => unwrapBlog(rawBlog), [rawBlog]);

    // Set page URL on client only
    useEffect(() => {
        setPageUrl(window.location.href);
    }, []);

    // Sanitize HTML on client side (DOMPurify requires browser env)
    useEffect(() => {
        if (blog?.content)
        {
            import('dompurify').then(({ default: DOMPurify }) => {
                setSanitizedContent(DOMPurify.sanitize(blog.content));
            });
        }
    }, [blog?.content]);

    // Derive sidebar data from the single call
    const allBlogs: Blog[] = sidebarData?.items || [];
    const recentPosts: Blog[] = allBlogs.slice(0, 5);
    const categories: string[] = useMemo(() =>
        Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean))),
        [allBlogs]
    );
    // Related = same category, exclude current slug (up to 3)
    const relatedBlogs: Blog[] = useMemo(() =>
        allBlogs.filter((b) => b.category === blog?.category && b.slug !== slug).slice(0, 3),
        [allBlogs, blog?.category, slug]
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`;
    };

    const handleCategoryChange = (cat: string) => {
        window.location.href = `/blog?category=${encodeURIComponent(cat)}`;
    };

    // ── Loading ──
    if (isLoading)
    {
        return (
            <div className="togo-blog-details-sec pt-150 pb-120">
                <div className="container">
                    <div className="row gx-50">
                        <div className="col-lg-8"><BlogDetailSkeleton /></div>
                        <div className="col-lg-4" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error / Not Found ──
    if (error || !blog)
    {
        return (
            <div className="togo-blog-details-sec pt-150 pb-120">
                <div className="container text-center py-5">
                    <h4>Blog post not found.</h4>
                    <Link href="/blog" className="togo-btn-primary mt-3 d-inline-block">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const authorName = typeof blog.author === 'string'
        ? blog.author
        : (blog.author as { name?: string })?.name || 'Admin';

    return (
        <div className="togo-blog-details-sec pt-150 pb-120">
            <div className="container">
                <div className="row gx-50">
                    {/* ── Main content ── */}
                    <div className="col-lg-8">
                        <div className="togo-postbox-box">
                            <div className="togo-postbox-details-wrapper">

                                {/* Meta row: category | author | date */}
                                <div className="togo-postbox-details-tags mb-30">
                                    <span>{blog.category || 'Uncategorized'}</span>
                                    <span>By {authorName}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <CalendarSVG />
                                        {formatDate(blog.publishedAt || blog.createdAt)}
                                    </span>
                                </div>

                                {/* Title */}
                                <h4 className="togo-postbox-details-title mb-30">{blog.title}</h4>

                                {/* Hero Image */}
                                <div className="togo-postbox-details-thumb mb-30">
                                    <SafeImage
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        fallbackSrc={FALLBACK_IMAGE}
                                        style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
                                    />
                                </div>

                                {/* Rich HTML content */}
                                <div
                                    className="togo-postbox-details-text mb-30"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizedContent || blog.content || ''
                                    }}
                                />

                                {/* Tags */}
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="mb-30" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                        <strong style={{ marginRight: 4 }}>Tags:</strong>
                                        {blog.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    background: '#f4f4f4',
                                                    padding: '4px 14px',
                                                    borderRadius: 20,
                                                    fontSize: 13,
                                                    border: '1px solid #ddd',
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Social Share */}
                                <div className="mb-40" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <strong>Share:</strong>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: '#1877f2' }} title="Share on Facebook"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 13 20" fill="none">
                                            <path d="M0.75 7.75V11.75H3.75V18.75H7.75V11.75H10.75L11.75 7.75H7.75V5.75C7.75 5.20533 8.20533 4.75 8.75 4.75H11.75V0.75H8.75C6.02667 0.75 3.75 3.02667 3.75 5.75V7.75H0.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(blog.title)}`}
                                        target="_blank" rel="noopener noreferrer" title="Share on Twitter/X"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M14.5 0.75L9.06391 7.10276M1.66667 15.4167L7.10276 9.06391M7.10276 9.06391L12.4146 15.1021C12.5892 15.3006 12.8577 15.4167 13.1421 15.4167H14.4934C15.2603 15.4167 15.6917 14.6368 15.2208 14.1016L9.06391 7.10276M7.10276 9.06391L0.945838 2.06506C0.475005 1.52984 0.906398 0.75 1.6733 0.75H3.02462C3.30901 0.75 3.57748 0.866089 3.75208 1.06457L9.06391 7.10276" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + pageUrl)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: '#25D366' }} title="Share on WhatsApp"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M7.45281 13.1794C6.34487 10.9183 7.85268 6.5121 12.9247 7.23245C18.5112 8.02588 17.5058 16.7097 12.8479 16.3706C11.374 16.2632 10.8167 15.0418 10.6712 13.794M10.6712 13.794C10.5608 12.8479 10.6872 11.8867 10.8304 11.3844C11.0746 10.5272 11.4794 10.6437 11.1836 11.7775C11.0396 12.3294 10.8639 13.022 10.6712 13.794ZM10.6712 13.794C10.1568 15.8538 9.52071 18.4787 9.04037 20.5019" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: '#0a66c2' }} title="Share on LinkedIn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M16.5 3H7.5C5.01472 3 3 5.01472 3 7.5V16.5C3 18.9853 5.01472 21 7.5 21H16.5C18.9853 21 21 18.9853 21 16.5V7.5C21 5.01472 18.9853 3 16.5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 11V16M8 8V8.01M12 16V13C12 11.8954 12.8954 11 14 11C15.1046 11 16 11.8954 16 13V16M12 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Related Articles */}
                            {relatedBlogs.length > 0 && (
                                <div className="togo-postbox-details-related">
                                    <h3 className="text-center mb-30">Related Articles</h3>
                                    <div className="row">
                                        {relatedBlogs.map((related) => (
                                            <div key={related._id} className="col-xl-4 col-md-6">
                                                <div className="togo-blog-item mb-24">
                                                    <div className="togo-blog-item-thumb">
                                                        <Link href={`/blog/${related.slug}`}>
                                                            <SafeImage
                                                                src={related.featuredImage}
                                                                alt={related.title}
                                                                fallbackSrc="/assets/img/blog/blog-thumb-1.jpg"
                                                                style={{ width: '100%', objectFit: 'cover' }}
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="togo-blog-item-content">
                                                        <div className="togo-blog-item-meta mb-10">
                                                            <span className="label">{related.category || 'Guide'}</span>
                                                            <span className="date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <CalendarSVG />
                                                                {formatDate(related.publishedAt || related.createdAt)}
                                                            </span>
                                                        </div>
                                                        <h4 className="togo-blog-item-title">
                                                            <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                                                        </h4>
                                                        <div className="togo-blog-item-btn">
                                                            <Link className="line-border" href={`/blog/${related.slug}`}>
                                                                <span>Read more</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="col-lg-4">
                        <BlogSidebar
                            recentPosts={recentPosts}
                            categories={categories}
                            activeCategory={blog.category || ''}
                            onCategoryChange={handleCategoryChange}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onSearchSubmit={handleSearchSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
