import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor)
    {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null)
        {
            return;
        }

        if (url === '')
        {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Image URL');
        if (url)
        {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const cls = (active: boolean) => `btn btn-sm ${active ? 'btn-secondary' : 'btn-light'} p-2 d-flex align-items-center justify-content-center`;

    return (
        <div className="d-flex flex-wrap gap-1 p-2 bg-light border-bottom sticky-top" style={{ zIndex: 10 }}>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={cls(editor.isActive('bold'))} title="Bold">
                <Bold size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={cls(editor.isActive('italic'))} title="Italic">
                <Italic size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={cls(editor.isActive('strike'))} title="Strikethrough">
                <Strikethrough size={16} />
            </button>
            <div className="mx-1 border-start"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cls(editor.isActive('heading', { level: 1 }))} title="Heading 1">
                <Heading1 size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cls(editor.isActive('heading', { level: 2 }))} title="Heading 2">
                <Heading2 size={16} />
            </button>
            <div className="mx-1 border-start"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cls(editor.isActive('bulletList'))} title="Bullet List">
                <List size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cls(editor.isActive('orderedList'))} title="Ordered List">
                <ListOrdered size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cls(editor.isActive('blockquote'))} title="Blockquote">
                <Quote size={16} />
            </button>
            <div className="mx-1 border-start"></div>
            <button type="button" onClick={setLink} className={cls(editor.isActive('link'))} title="Add Link">
                <LinkIcon size={16} />
            </button>
            <button type="button" onClick={addImage} className={cls(false)} title="Add Image">
                <ImageIcon size={16} />
            </button>
            <div className="mx-1 border-start"></div>
            <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className={cls(false)} title="Undo">
                <Undo size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className={cls(false)} title="Redo">
                <Redo size={16} />
            </button>
        </div>
    );
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none p-3 max-w-none',
                style: 'min-height: 400px;'
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML())
        {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="border rounded bg-white overflow-hidden d-flex flex-column h-100">
            <MenuBar editor={editor} />
            <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '70vh' }}>
                <EditorContent editor={editor} />
            </div>
            <style jsx global>{`
                .ProseMirror {
                    outline: none !important;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .prose img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
}
