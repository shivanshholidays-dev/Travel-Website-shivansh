'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useBlogHooks } from '../../lib/hooks/useBlogHooks';
import { Blog } from '../../lib/types/blog.types';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { BlogListSkeleton } from '../../components/common/SkeletonLoader';
import { DateUtils } from '../../lib/utils/date-utils';
import { getBlogCategoryLabel } from '../../lib/utils/enum-mappings';
import SafeImage from '../../components/common/SafeImage';

const CalendarSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M10.875 2.25V0.75M4.125 2.25V0.75M0.9375 4.5H14.0625M7.5 14.25C4.31802 14.25 2.72703 14.25 1.73851 13.2615C0.75 12.273 0.75 10.682 0.75 7.5C0.75 4.31802 0.75 3.47703 1.73851 2.48851C2.72703 1.5 4.31802 1.5 7.5 1.5C10.682 1.5 12.273 1.5 13.2615 2.48851C14.25 3.47703 14.25 4.31802 14.25 7.5C14.25 10.682 14.25 12.273 13.2615 13.2615C12.273 14.25 10.682 14.25 7.5 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function formatDate(dateStr?: string): string {
    return DateUtils.formatToIST(dateStr, 'MMM DD, YYYY');
}

function getExcerpt(blog: Blog): string {
    if (blog.excerpt) return blog.excerpt;
    if (blog.content)
    {
        const stripped = blog.content.replace(/<[^>]*>/g, '');
        return stripped.slice(0, 120) + (stripped.length > 120 ? '...' : '');
    }
    return '';
}

const FALLBACK_IMAGE = '/assets/img/blog/blog-thumb-1.jpg';


export default function BlogListClient() {
    const { useBlogsList } = useBlogHooks();

    const [page, setPage] = useState(1);
    const [activeCategory, setActiveCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');

    // Debounce: fire search 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setSubmittedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const limit = 5;

    // ── Main paginated list (changes with filters/page) ──
    const mainParams: Record<string, unknown> = { page, limit };
    if (activeCategory) mainParams.category = activeCategory;
    if (submittedSearch) mainParams.search = submittedSearch;

    const { data, isLoading, error } = useBlogsList(mainParams);

    // ── Sidebar data (stable, fetched once — same key → cached) ──
    const { data: sidebarData } = useBlogsList({ page: 1, limit: 10 });

    const blogs: Blog[] = data?.items || [];
    const totalPages = data?.totalPages || 1;

    // Derive sidebar info from the same stable query key (no extra call)
    const sidebarBlogs: Blog[] = sidebarData?.items || [];
    const recentPosts: Blog[] = sidebarBlogs.slice(0, 5);
    const categories: string[] = useMemo(() =>
        Array.from(new Set(sidebarBlogs.map((b) => b.category).filter(Boolean))),
        [sidebarBlogs]
    );

    const handleCategoryChange = useCallback((cat: string) => {
        setActiveCategory(cat);
        setPage(1);
    }, []);

    const handleSearchChange = useCallback((q: string) => {
        setSearchQuery(q);
        // If user clears the box, instantly reset
        if (!q)
        {
            setSubmittedSearch('');
            setPage(1);
        }
    }, []);

    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedSearch(searchQuery);
        setPage(1);
    }, [searchQuery]);

    return (
        <div className="togo-blog-sidebar-sec pt-120 pb-120">
            <div className="container">
                <div className="row">
                    {/* ── Main blog list ── */}
                    <div className="col-lg-8">
                        {isLoading ? (
                            <BlogListSkeleton />
                        ) : error ? (
                            <div className="alert alert-danger">Failed to load blog posts. Please try again.</div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-5">
                                <p>No blog posts found.</p>
                                {(activeCategory || submittedSearch) && (
                                    <button
                                        className="togo-btn-primary mt-3"
                                        onClick={() => { setActiveCategory(''); setSubmittedSearch(''); setSearchQuery(''); setPage(1); }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="togo-sidebar-box">
                                <div className="togo-sidebar-item-wrap">
                                    {blogs.map((blog) => (
                                        <div key={blog._id} className="togo-sidebar-item d-flex align-items-center mb-50">
                                            <div className="togo-sidebar-item-thumb">
                                                <Link href={`/blog/${blog.slug}`}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <SafeImage
                                                        src={blog.featuredImage}
                                                        alt={blog.title}
                                                        fallbackSrc={FALLBACK_IMAGE}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Link>
                                            </div>
                                            <div className="togo-sidebar-item-content">
                                                <span className="togo-sidebar-item-tag">{blog.category ? getBlogCategoryLabel(blog.category) : 'Uncategorized'}</span>
                                                <h4 className="togo-sidebar-item-title">
                                                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', marginBottom: 10 }}>
                                                    <CalendarSVG />
                                                    <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                                                </div>
                                                <p>{getExcerpt(blog)}</p>
                                                <Link className="togo-tour-btn line-border" href={`/blog/${blog.slug}`}>
                                                    <span>Read More</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination — matches template HTML exactly */}
                                {totalPages > 1 && (
                                    <div className="row">
                                        <div className="togo-tour-pagination mt-20">
                                            <div className="col-lg-12">
                                                <div className="togo-pagination">
                                                    <nav>
                                                        <ul>
                                                            {/* Prev arrow */}
                                                            {page > 1 && (
                                                                <li>
                                                                    <a
                                                                        className="prev"
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); setPage((p) => p - 1); }}
                                                                    >
                                                                        <span>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                                                                <path d="M6.25 11.75L0.75 6.25L6.25 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            )}

                                                            {/* Page numbers */}
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                                <li key={p}>
                                                                    <a
                                                                        className={p === page ? 'active' : ''}
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                                                                    >
                                                                        {p}
                                                                    </a>
                                                                </li>
                                                            ))}

                                                            {/* Next arrow */}
                                                            {page < totalPages && (
                                                                <li>
                                                                    <a
                                                                        className="next"
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }}
                                                                    >
                                                                        <span>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                                                                <path d="M0.75 11.75L6.25 6.25L0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                        </span>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="col-lg-4">
                        <BlogSidebar
                            recentPosts={recentPosts}
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={handleCategoryChange}
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            onSearchSubmit={handleSearchSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
