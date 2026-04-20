'use client';

import Link from 'next/link';
import { useAdminBlogHooks } from '@hooks/admin/useAdminBlogHooks';
import toast from 'react-hot-toast';
import { DateUtils } from '@lib/utils/date-utils';
import { BlogStatus } from '@lib/constants/enums';
import { getBlogCategoryLabel } from '@lib/utils/enum-mappings';
import Pagination from '@components/ui/Pagination';
import { useState } from 'react';
import Modal from '@components/ui/Modal';
import { Trash2 } from 'lucide-react';

export default function AdminBlogsPage() {
    const [page, setPage] = useState(1);
    const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);
    const limit = 10;
    const { useBlogsList, useDeleteBlog, usePublishBlog, useUnpublishBlog } = useAdminBlogHooks();

    const { data: response, isLoading } = useBlogsList({ page, limit });
    const deleteMutation = useDeleteBlog();
    const publishMutation = usePublishBlog();
    const unpublishMutation = useUnpublishBlog();

    const result = (response as any)?.data ?? response;
    const blogs = result?.items || [];
    const totalPages = result?.totalPages || 1;

    const handleDelete = (id: string, title: string) => {
        setBlogToDelete({ id, title });
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        try
        {
            await deleteMutation.mutateAsync(blogToDelete.id);
            toast.success('Blog deleted');
            setBlogToDelete(null);
        } catch (err)
        {
            toast.error('Failed to delete blog');
        }
    };

    const handlePublishToggle = async (id: string, isPublished: boolean) => {
        try
        {
            if (isPublished)
            {
                await unpublishMutation.mutateAsync(id);
                toast.success('Blog unpublished');
            } else
            {
                await publishMutation.mutateAsync(id);
                toast.success('Blog published');
            }
        } catch (err)
        {
            toast.error('Failed to change publish status');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Blog Manager</h4>
                    <Link href="/admin/blogs/new" className="togo-btn-primary">+ Create Post</Link>
                </div>

                <div className="mb-3" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Article</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Author</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Date</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">Loading blogs...</td></tr>
                                ) : !blogs || blogs.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">No blog posts found.</td></tr>
                                ) : (
                                    blogs.map((b: any) => (
                                        <tr key={b.id || b._id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: '48px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                        <img
                                                            src={b.featuredImage?.startsWith('http') ? b.featuredImage : b.featuredImage ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${b.featuredImage}` : '/assets/img/blog/blog-1.jpg'}
                                                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div style={{ maxWidth: '300px' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.title}>
                                                            {b.title}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#888' }}>{getBlogCategoryLabel(b.category || 'GENERAL')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#555' }}>
                                                    {process.env.NODE_ENV === 'development' ? (typeof b.author === 'string' ? b.author : b.author?.name || 'Admin') : (b.author?.name || 'Admin')}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#888' }}>
                                                {DateUtils.formatToIST(b.createdAt || b.date, 'DD MMM YYYY')}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                                    backgroundColor: b.isPublished ? '#E8F5E9' : '#F3F4F6',
                                                    color: b.isPublished ? '#2E7D32' : '#6B7280'
                                                }}>{b.isPublished ? 'Published' : 'Draft'}</span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => handlePublishToggle(b.id || b._id, !!b.isPublished)}
                                                        disabled={publishMutation.isPending || unpublishMutation.isPending}
                                                        className={`btn btn-sm ${b.isPublished ? 'btn-light' : 'btn-primary'}`}
                                                        style={{ fontWeight: 600, fontSize: '12px', borderRadius: '8px', minWidth: '85px' }}
                                                    >
                                                        {b.isPublished ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <Link href={`/admin/blogs/${b.id || b._id}/edit`} className="btn btn-sm btn-light" style={{ fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(b.id || b._id, b.title)}
                                                        disabled={deleteMutation.isPending}
                                                        className="btn btn-sm btn-outline-danger"
                                                        style={{ fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-30 d-flex justify-content-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            <Modal
                isOpen={!!blogToDelete}
                onClose={() => setBlogToDelete(null)}
                title="Confirm Blog Deletion"
                size="sm"
                footer={(
                    <>
                        <button type="button" onClick={() => setBlogToDelete(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="button"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Post'}
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: 16 }}>Delete "<span style={{ color: '#dc2626' }}>{blogToDelete?.title}</span>"?</p>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
                        This blog post will be permanently removed. This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
