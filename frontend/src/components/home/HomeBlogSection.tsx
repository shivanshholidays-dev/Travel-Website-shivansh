'use client';

import React from 'react';
import Link from 'next/link';
import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';
import { getImgUrl } from '@/src/lib/utils/image';
import { DateUtils } from '@/src/lib/utils/date-utils';
import SafeImage from '@/src/components/common/SafeImage';

const DateSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M10.875 2.25V0.75M4.125 2.25V0.75M0.9375 4.5H14.0625M7.5 14.25C4.31802 14.25 2.72703 14.25 1.73851 13.2615C0.75 12.273 0.75 10.682 0.75 7.5C0.75 4.31802 0.75 3.47703 1.73851 2.48851C2.72703 1.5 4.31802 1.5 7.5 1.5C10.682 1.5 12.273 1.5 13.2615 2.48851C14.25 3.47703 14.25 4.31802 14.25 7.5C14.25 10.682 14.25 12.273 13.2615 13.2615C12.273 14.25 10.682 14.25 7.5 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Static data removed to use dynamic home data

export default function HomeBlogSection() {
    const { useBlogs } = useHomeHooks();
    const { data: blogsRes, isLoading } = useBlogs();

    const blogs = blogsRes?.data || [];

    if (isLoading) return null;
    if (blogs.length === 0) return null;

    const mainBlog = blogs[0];
    const subBlogs = blogs.slice(1);

    return (
        <div className="togo-blog-sec pt-50 pb-0">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-blog-heading text-center mb-40">
                            <span className="togo-section-subtitle mb-10 fade-anim">our blog</span>
                            <h3 className="togo-section-title ff-playfair fw-600 mb-15 fade-anim">Crafting Unforgettable Journeys</h3>
                            <div className="togo-blog-text fade-anim">
                                <p>Here where share travel tips, destination guide, and <br /> stories that inspire your next adventure.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row gx-45">
                    <div className="col-lg-5">
                        <div className="togo-blog-item mb-24 fade-anim">
                            <div className="togo-blog-item-thumb">
                                <Link href={`/blog/${mainBlog.slug}`}>
                                    <SafeImage style={{ width: '100%', height: '400px', objectFit: 'cover' }} src={getImgUrl(mainBlog.featuredImage)} alt={mainBlog.title} fallbackSrc="/assets/img/blog/home-1/blog-1.jpg" />
                                </Link>
                            </div>
                            <div className="togo-blog-item-content">
                                <div className="togo-blog-item-meta mb-10">
                                    <span className="label">{"Latest News"}</span>
                                    <span className="date"><DateSVG /> {DateUtils.formatToIST(mainBlog.createdAt)}</span>
                                </div>
                                <h4 className="togo-blog-item-title"><Link href={`/blog/${mainBlog.slug}`}>{mainBlog.title}</Link></h4>
                                <p>{mainBlog.excerpt || (mainBlog.content && (mainBlog.content.substring(0, 150) + '...'))}</p>
                                <div className="togo-blog-item-btn">
                                    <Link className="line-border" href={`/blog/${mainBlog.slug}`}><span>Read more</span></Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        {subBlogs.map((blog: any) => (
                            <div key={blog._id} className="togo-blog-item blog-style-2 mb-24 fade-anim">
                                <div className="togo-blog-item-thumb">
                                    <Link href={`/blog/${blog.slug}`}>
                                        <SafeImage style={{ width: '100%', minHeight: '180px', height: '100%', objectFit: 'cover' }} src={getImgUrl(blog.featuredImage)} alt={blog.title} fallbackSrc="/assets/img/blog/home-1/blog-2.jpg" />
                                    </Link>
                                </div>
                                <div className="togo-blog-item-content">
                                    <div className="togo-blog-item-meta mb-10">
                                        <span className="label">{"Travel Tips"}</span>
                                        <span className="date"><DateSVG /> {DateUtils.formatToIST(blog.createdAt)}</span>
                                    </div>
                                    <h4 className="togo-blog-item-title"><Link href={`/blog/${blog.slug}`}>{blog.title}</Link></h4>
                                    <p>{blog.excerpt || (blog.content && (blog.content.substring(0, 100) + '...'))}</p>
                                    <div className="togo-blog-item-btn">
                                        <Link className="line-border" href={`/blog/${blog.slug}`}><span>Read more</span></Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
