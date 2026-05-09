'use client';

// src/components/admin/RichTextEditor.tsx
// Sprint 3 — éditeur HTML basé sur TipTap.
// Préserve les balises (h1-h3, p, strong, em, ul/ol/li, a) lors de l'édition.
//
// Usage : <RichTextEditor html={value} onChange={setValue} />
// Émet onChange(html) à chaque modification (debounce côté parent).
//
// Dépendances npm requises (à ajouter au package.json) :
//   "@tiptap/react": "^2.10.0",
//   "@tiptap/starter-kit": "^2.10.0",
//   "@tiptap/extension-link": "^2.10.0"

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Link as LinkIcon, Undo2, Redo2,
} from 'lucide-react';

interface Props {
  html: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
}

export default function RichTextEditor({ html, onChange, minHeight = 120 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline', rel: 'noopener noreferrer' },
      }),
    ],
    content: html || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3',
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // Synchronise quand la prop html change de façon externe (changement de bloc sélectionné)
  useEffect(() => {
    if (editor && html !== editor.getHTML()) editor.commands.setContent(html || '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  if (!editor) return <div className="p-3 text-xs text-gray-400">Chargement…</div>;

  function setLink() {
    const prev = editor!.getAttributes('link').href || '';
    const url = window.prompt('URL du lien (vide pour supprimer) :', prev);
    if (url === null) return;
    if (url === '') editor!.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  const btn = (active: boolean) =>
    `w-7 h-7 grid place-items-center rounded text-gray-700 hover:bg-gray-100 ${active ? 'bg-gray-200 text-gray-900' : ''}`;

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-gray-200 bg-gray-50">
        <button type="button" title="Gras" onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive('bold'))}><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" title="Italique" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive('italic'))}><Italic className="w-3.5 h-3.5" /></button>
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" title="Titre 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" title="Titre 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-3.5 h-3.5" /></button>
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" title="Liste à puces" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive('bulletList'))}><List className="w-3.5 h-3.5" /></button>
        <button type="button" title="Liste numérotée" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive('orderedList'))}><ListOrdered className="w-3.5 h-3.5" /></button>
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" title="Lien" onClick={setLink}
          className={btn(editor.isActive('link'))}><LinkIcon className="w-3.5 h-3.5" /></button>
        <span className="flex-1" />
        <button type="button" title="Annuler" onClick={() => editor.chain().focus().undo().run()}
          className={btn(false)}><Undo2 className="w-3.5 h-3.5" /></button>
        <button type="button" title="Rétablir" onClick={() => editor.chain().focus().redo().run()}
          className={btn(false)}><Redo2 className="w-3.5 h-3.5" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
