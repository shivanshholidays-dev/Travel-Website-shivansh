'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Blog } from '../../lib/types/blog.types';
import { getBlogCategoryLabel } from '../../lib/utils/enum-mappings';

interface BlogSidebarProps {
    recentPosts: Blog[];
    categories: string[];
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
}

export default function BlogSidebar({
    recentPosts,
    categories,
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
}: BlogSidebarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        onSearchChange('');
        onSearchSubmit({ preventDefault: () => { } } as React.FormEvent);
        inputRef.current?.focus();
    };

    return (
        <div className="togo-sidebar-wrapper">
            {/* Search Widget */}
            <div className="togo-sidebar-widget mb-30">
                <h4 className="togo-sidebar-widget-title">Search</h4>
                <div className="togo-sidebar-search">
                    <form onSubmit={onSearchSubmit}>
                        <div className="togo-sidebar-search-input" style={{ position: 'relative' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search blogs..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            {/* Clear × button */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    title="Clear search"
                                    style={{
                                        position: 'absolute',
                                        right: 46,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        color: '#aaa',
                                        lineHeight: 1,
                                        padding: '0 4px',
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                            <button type="submit" title="Search">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.9999 19L14.6499 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentcolor" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Categories Widget */}
            {categories.length > 0 && (
                <div className="togo-sidebar-widget mb-30">
                    <h4 className="togo-sidebar-widget-title">Categories</h4>
                    <div className="togo-sidebar-post-wrap">
                        {['', ...categories].map((cat) => (
                            <button
                                key={cat || '__all__'}
                                className="togo-sidebar-post-title"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'block',
                                    textAlign: 'left',
                                    padding: '5px 0',
                                    fontWeight: activeCategory === cat ? 700 : 400,
                                    color: activeCategory === cat ? 'var(--togo-theme-1, #16a085)' : 'inherit',
                                    width: '100%',
                                }}
                                onClick={() => onCategoryChange(cat)}
                            >
                                {cat ? getBlogCategoryLabel(cat) : 'All'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Posts Widget */}
            {recentPosts.length > 0 && (
                <div className="togo-sidebar-widget mb-30">
                    <h4 className="togo-sidebar-widget-title">Recent Posts</h4>
                    <div className="togo-sidebar-post-wrap">
                        {recentPosts.map((post) => (
                            <Link key={post._id} href={`/blog/${post.slug}`} className="togo-sidebar-post-title">
                                {post.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
