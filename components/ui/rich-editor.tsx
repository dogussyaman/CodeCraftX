"use client"

import { useCallback, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RichEditorProps {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
  id?: string
  "aria-label"?: string
}

export function RichEditor({
  value,
  onChange,
  placeholder = "Metin yazın…",
  minHeight = "12rem",
  className,
  id,
  "aria-label": ariaLabel,
}: RichEditorProps) {
  const lastEmittedRef = useRef<string>(value)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Markdown,
      ],
      content: value || "",
      contentType: "markdown",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "aria-label": ariaLabel ?? "Zengin metin alanı",
          class:
            "prose prose-sm dark:prose-invert max-w-none min-h-[8rem] px-3 py-2 outline-none focus:outline-none",
        },
      },
    },
    [],
  )

  const onUpdate = useCallback(() => {
    if (!editor) return
    const md = editor.getMarkdown()
    lastEmittedRef.current = md
    onChange(md)
  }, [editor, onChange])

  useEffect(() => {
    if (!editor) return
    editor.on("update", onUpdate)
    return () => {
      editor.off("update", onUpdate)
    }
  }, [editor, onUpdate])

  useEffect(() => {
    if (!editor || value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    editor.commands.setContent(value || "", { contentType: "markdown" })
  }, [editor, value])

  if (!editor) {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-col rounded-md border border-input bg-transparent shadow-xs",
          className,
        )}
        style={{ minHeight }}
      >
        <div className="flex flex-wrap gap-0.5 border-b border-input px-2 py-1.5">
          <Button type="button" variant="ghost" size="icon-sm" disabled className="opacity-50" aria-hidden />
          <Button type="button" variant="ghost" size="icon-sm" disabled className="opacity-50" aria-hidden />
          <Button type="button" variant="ghost" size="icon-sm" disabled className="opacity-50" aria-hidden />
        </div>
        <div className="px-3 py-2 text-sm text-muted-foreground" style={{ minHeight: "8rem" }}>
          {placeholder}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-md border border-input bg-transparent shadow-xs transition-shadow focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        className,
      )}
      style={{ minHeight }}
      id={id}
    >
      <div className="flex flex-wrap gap-0.5 border-b border-input px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={editor.isActive("bold") ? "bg-muted" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}
          aria-label="Kalın"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={editor.isActive("italic") ? "bg-muted" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive("italic")}
          aria-label="İtalik"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-pressed={editor.isActive("heading", { level: 2 })}
          aria-label="Başlık 2"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive("bulletList")}
          aria-label="Madde listesi"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive("orderedList")}
          aria-label="Numaralı liste"
        >
          <ListOrdered className="size-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
