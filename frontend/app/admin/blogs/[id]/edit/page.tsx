'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminBlogHooks } from '@hooks/admin/useAdminBlogHooks';
import toast from 'react-hot-toast';
import { getImgUrl } from '@/src/lib/utils/image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { adminBlogsApi } from '../../../../../src/lib/api/admin/blogs.api';
import { BlogCategory } from '@lib/constants/enums';

export default function AdminBlogEditPage() {
    const router = useRouter();
    const params = useParams();
    const blogId = params.id as string;

    const { useUpdateBlog } = useAdminBlogHooks();
    const updateMutation = useUpdateBlog();

    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState<BlogCategory>(BlogCategory.GENERAL);
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState('');

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
    });

    useEffect(() => {
        const fetchBlog = async () => {
            try
            {
                // Not a hook because we just need to populate the form once
                const blog: any = await adminBlogsApi.getAll().then((res: any) =>
                    (res.items || res.data?.items || []).find((b: any) => b._id === blogId || b.id === blogId)
                );

                if (blog)
                {
                    setTitle(blog.title || '');
                    setExcerpt(blog.excerpt || '');
                    setCategory(blog.category as BlogCategory || BlogCategory.GENERAL);
                    setExistingImage(blog.featuredImage || '');
                    if (editor)
                    {
                        editor.commands.setContent(blog.content || '');
                    }
                }
            } catch (err)
            {
                toast.error('Failed to fetch blog post');
            } finally
            {
                setIsLoading(false);
            }
        };
        fetchBlog();
    }, [blogId, editor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !editor) return toast.error('Title and content are required');

        try
        {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('excerpt', excerpt);
            formData.append('content', editor.getHTML());
            formData.append('category', category);
            if (featuredImage)
            {
                formData.append('featuredImage', featuredImage);
            }

            await updateMutation.mutateAsync({ id: blogId, data: formData as any });
            toast.success('Blog post updated');
            router.push('/admin/blogs');
        } catch (err)
        {
            toast.error('Failed to update blog post');
        }
    };

    if (isLoading) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Edit Blog Post</h4>
                    <button onClick={() => router.push('/admin/blogs')} className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                        Cancel
                    </button>
                </div>

                <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} className="row">
                        <div className="col-12 mb-20">
                            <label className="form-label mb-10" style={{ fontWeight: 600 }}>Post Title</label>
                            <input
                                type="text" className="form-control"
                                value={title} onChange={(e) => setTitle(e.target.value)} required
                                style={{ borderRadius: '8px', padding: '12px', border: '1px solid #eee' }}
                            />
                        </div>
                        <div className="col-12 mb-20">
                            <label className="form-label mb-10" style={{ fontWeight: 600 }}>Category</label>
                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                                style={{ borderRadius: '8px', padding: '12px', border: '1px solid #eee', fontWeight: 600 }}
                            >
                                {Object.values(BlogCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 mb-20">
                            <label className="form-label mb-10" style={{ fontWeight: 600 }}>Featured Image (Leave empty to keep existing)</label>
                            {existingImage && <div className="mb-10"><img src={getImgUrl(existingImage)} alt="Current" style={{ height: '100px', borderRadius: '8px' }} /></div>}
                            <input
                                type="file" className="form-control" accept="image/*"
                                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                                style={{ borderRadius: '8px', padding: '10px', border: '1px solid #eee' }}
                            />
                        </div>
                        <div className="col-12 mb-20">
                            <label className="form-label mb-10" style={{ fontWeight: 600 }}>Short Excerpt (optional)</label>
                            <textarea
                                className="form-control" rows={2}
                                value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                                style={{ borderRadius: '8px', padding: '12px', border: '1px solid #eee' }}
                            />
                        </div>
                        <div className="col-12 mb-30">
                            <label className="form-label mb-10" style={{ fontWeight: 600 }}>Content</label>

                            {/* Simple Tiptap Toolbar */}
                            {editor && (
                                <div className="mb-10 d-flex gap-2" style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px 8px 0 0', border: '1px solid #eee', borderBottom: 'none' }}>
                                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="btn btn-sm btn-light">Bold</button>
                                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="btn btn-sm btn-light">Italic</button>
                                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn btn-sm btn-light">H2</button>
                                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn btn-sm btn-light">Bullet List</button>
                                </div>
                            )}

                            <div style={{ border: '1px solid #eee', borderRadius: '0 0 8px 8px', minHeight: '300px', padding: '15px' }}>
                                <EditorContent editor={editor} style={{ minHeight: '300px', outline: 'none' }} />
                            </div>
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="togo-btn-primary w-100"
                                disabled={updateMutation.isPending}
                                style={{ padding: '14px', borderRadius: '8px', border: 'none' }}
                            >
                                {updateMutation.isPending ? 'Updating...' : 'Update Blog Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
