import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { MdxHeading } from "./MdxHeading"
import { MdxBlockquote } from "./MdxBlockquote"
import { MdxCodeInline, MdxCodeBlock } from "./MdxCode"
import { MdxPre } from "./MdxPre"
import { MdxImage } from "./MdxImage"
import type { Components } from "react-markdown"
import { sanitizeHtml } from "@/lib/sanitize"
import "highlight.js/styles/github.min.css"

const proseClasses =
  "prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-li:my-0.5"

interface MdxRendererProps {
  content: string
  className?: string
}

function isLikelyMarkdown(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed.includes("\n## ") ||
    trimmed.includes("\n- ") ||
    trimmed.includes("\n* ") ||
    trimmed.includes("\n1. ") ||
    /^#\s/m.test(trimmed) ||
    trimmed.includes("```") ||
    trimmed.includes("**") ||
    trimmed.includes("__") ||
    trimmed.includes("`")
  )
}

const components: Components = {
  h1: ({ children }) => <MdxHeading level={1}>{children}</MdxHeading>,
  h2: ({ children }) => <MdxHeading level={2}>{children}</MdxHeading>,
  h3: ({ children }) => <MdxHeading level={3}>{children}</MdxHeading>,
  h4: ({ children }) => <MdxHeading level={4}>{children}</MdxHeading>,
  h5: ({ children }) => <MdxHeading level={5}>{children}</MdxHeading>,
  h6: ({ children }) => <MdxHeading level={6}>{children}</MdxHeading>,
  blockquote: ({ children }) => <MdxBlockquote>{children}</MdxBlockquote>,
  pre: ({ children }) => <MdxPre>{children}</MdxPre>,
  code: ({ className, children, ...props }) => {
    const isBlock = className != null && String(className).includes("language-")
    return isBlock ? (
      <MdxCodeBlock className={className ?? undefined} {...props}>
        {children}
      </MdxCodeBlock>
    ) : (
      <MdxCodeInline {...props}>{children}</MdxCodeInline>
    )
  },
  img: ({ src, alt, ...props }) => (
    <MdxImage src={src ?? ""} alt={alt ?? ""} {...props} />
  ),
}

export function MdxRenderer({ content, className }: MdxRendererProps) {
  if (!content?.trim()) return null

  if (!isLikelyMarkdown(content)) {
    return (
      <div
        className={proseClasses + (className ? ` ${className}` : "")}
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(content.replace(/\n/g, "<br />")),
        }}
      />
    )
  }

  return (
    <div className={proseClasses + (className ? ` ${className}` : "")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
