'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminBlogHooks } from '@hooks/admin/useAdminBlogHooks';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BlogCategory } from '@lib/constants/enums';

export default function AdminBlogNewPage() {
    const router = useRouter();
    const { useCreateBlog } = useAdminBlogHooks();
    const createMutation = useCreateBlog();

    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState<BlogCategory>(BlogCategory.GENERAL);
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Start writing your blog post here...</p>',
        immediatelyRender: false,
    });

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

            await createMutation.mutateAsync(formData as any);
            toast.success('Blog post created (Draft)');
            router.push('/admin/blogs');
        } catch (err)
        {
            toast.error('Failed to create blog post');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-40">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-1" style={{ fontWeight: 900, fontSize: '28px' }}>Create New Article</h4>
                        <p className="text-muted small mb-0">Draft a new post for your travel blog.</p>
                    </div>
                    <button onClick={() => router.push('/admin/blogs')} className="btn btn-light d-flex align-items-center gap-2" style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600, border: '1px solid #eee' }}>
                        Cancel
                    </button>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-40">
                                    <h5 className="mb-20" style={{ fontWeight: 800, fontSize: '18px' }}>Content Details</h5>

                                    <div className="mb-25">
                                        <label className="form-label mb-10" style={{ fontWeight: 700, fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Article Title</label>
                                        <input
                                            type="text" className="form-control"
                                            placeholder="Enter a catchy title..."
                                            value={title} onChange={(e) => setTitle(e.target.value)} required
                                            style={{ borderRadius: '12px', padding: '15px', border: '1px solid #eee', fontSize: '16px', fontWeight: 600, background: '#fcfcfc' }}
                                        />
                                    </div>

                                    <div className="mb-25">
                                        <label className="form-label mb-10" style={{ fontWeight: 700, fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Short Summary / Excerpt</label>
                                        <textarea
                                            className="form-control" rows={3}
                                            placeholder="Write a brief intro..."
                                            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                                            style={{ borderRadius: '12px', padding: '15px', border: '1px solid #eee', background: '#fcfcfc' }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-0">
                                    <label className="form-label mb-10" style={{ fontWeight: 700, fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Editorial Body</label>

                                    {editor && (
                                        <div className="mb-1 d-flex flex-wrap gap-2 p-2" style={{ background: '#f8f9fa', borderRadius: '12px 12px 0 0', border: '1px solid #eee', borderBottom: 'none' }}>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-sm ${editor.isActive('bold') ? 'btn-dark' : 'btn-light'}`} style={{ borderRadius: '6px' }}>Bold</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-sm ${editor.isActive('italic') ? 'btn-dark' : 'btn-light'}`} style={{ borderRadius: '6px' }}>Italic</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-dark' : 'btn-light'}`} style={{ borderRadius: '6px' }}>H2</button>
                                            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-dark' : 'btn-light'}`} style={{ borderRadius: '6px' }}>List</button>
                                        </div>
                                    )}

                                    <div style={{ border: '1px solid #eee', borderRadius: '0 0 12px 12px', minHeight: '400px', padding: '20px', background: '#fff' }}>
                                        <EditorContent editor={editor} style={{ minHeight: '400px', outline: 'none' }} className="prose" />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9', position: 'sticky', top: '20px' }}>
                            <h5 className="mb-25" style={{ fontWeight: 800, fontSize: '18px' }}>Publishing Settings</h5>

                            <div className="mb-30">
                                <label className="form-label mb-10" style={{ fontWeight: 700, fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Category</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as BlogCategory)}
                                    style={{ borderRadius: '12px', padding: '12px', border: '1px solid #eee', fontWeight: 600 }}
                                >
                                    {Object.values(BlogCategory).map(cat => (
                                        <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-30">
                                <label className="form-label mb-10" style={{ fontWeight: 700, fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Cover Image</label>
                                <div style={{ border: '2px dashed #ddd', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#fafafa' }}>
                                    <input
                                        type="file" className="form-control d-none" id="blog-image" accept="image/*"
                                        onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                                    />
                                    <label htmlFor="blog-image" style={{ cursor: 'pointer', margin: 0 }}>
                                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🖼️</div>
                                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#111' }}>{featuredImage ? featuredImage.name : 'Upload Feature Image'}</span>
                                        <p className="text-muted small mb-0 mt-1">PNG, JPG up to 5MB</p>
                                    </label>
                                </div>
                            </div>

                            <div className="p-3 mb-30" style={{ background: '#e8f0fe', borderRadius: '12px', borderLeft: '4px solid #1a73e8' }}>
                                <p className="mb-0 small" style={{ fontWeight: 600, color: '#1a73e8' }}>Saved as draft by default. You can publish it from the main list later.</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                disabled={createMutation.isPending}
                                style={{ background: '#111', color: '#fff', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '15px' }}
                            >
                                {createMutation.isPending ? 'Deploying...' : 'Create & Save Draft'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
