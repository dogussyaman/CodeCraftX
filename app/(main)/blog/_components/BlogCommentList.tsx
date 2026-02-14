"use client"

import { BlogCommentForm } from "./BlogCommentForm"

interface CommentItem {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
  authorName: string
}

interface BlogCommentListProps {
  postId: string
  comments: CommentItem[]
}

function CommentBlock({ postId, comment, allComments }: { postId: string; comment: CommentItem; allComments: CommentItem[] }) {
  const replies = allComments.filter((c) => c.parent_id === comment.id)
  return (
    <div className="pl-0 md:pl-6 border-l-2 border-muted">
      <div className="py-3">
        <p className="text-sm font-medium">{comment.authorName}</p>
        <p className="text-xs text-muted-foreground mb-1">
          {new Date(comment.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
        <div className="mt-2">
          <BlogCommentForm postId={postId} parentId={comment.id} />
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((r) => (
            <CommentBlock key={r.id} postId={postId} comment={r} allComments={allComments} />
          ))}
        </div>
      )}
    </div>
  )
}

export function BlogCommentList({ postId, comments }: BlogCommentListProps) {
  const topLevel = comments.filter((c) => !c.parent_id)
  if (topLevel.length === 0) {
    return <p className="text-muted-foreground text-sm">Henüz yorum yok. İlk yorumu siz yapın.</p>
  }
  return (
    <ul className="space-y-4">
      {topLevel.map((comment) => (
        <li key={comment.id}>
          <CommentBlock postId={postId} comment={comment} allComments={comments} />
        </li>
      ))}
    </ul>
  )
}
