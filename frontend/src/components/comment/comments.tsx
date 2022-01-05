import React from 'react'
import { Link } from 'react-router-dom'

import { ArticleAction } from '~/reducers/article'
import { IComment } from '~/types'

import CommentCard from './comment_card'

interface CommentsProps {
  comments: IComment[]
  isAuthor: boolean
  userId: string
  dispatch: React.Dispatch<ArticleAction>
}
export function Comments({ comments, isAuthor, userId, dispatch }: CommentsProps) {
  const { rootComments, childrenComments } = comments.reduce(
    (result, item) => {
      if (item.parent_id === 'root') {
        result.rootComments.push(item)
      } else {
        result.childrenComments.push(item)
      }
      return result
    },
    { rootComments: [] as IComment[], childrenComments: [] as IComment[] }
  )
  return (
    <div>
      {rootComments.map((comment) => (
        <CommentSection
          comment={comment}
          key={comment.comment_id}
          childrenComments={childrenComments}
          dispatch={dispatch}
          isAuthor={isAuthor}
          userId={userId}
        />
      ))}
    </div>
  )
}
type CommentSectionProps = {
  comment: IComment
  childrenComments: IComment[]
  parent_id?: string
  isAuthor: boolean
  userId: string
  dispatch: React.Dispatch<ArticleAction>
}
const CommentSection = ({
  comment,
  childrenComments,
  parent_id,
  isAuthor,
  userId,
  dispatch,
}: CommentSectionProps) => {
  const childCommentsFn = () =>
    childrenComments.filter((c) => c.parent_id === comment.comment_id)

  return (
    <CommentCard
      comment={comment}
      dispatch={dispatch}
      isAuthor={isAuthor}
      userId={userId}>
      {childCommentsFn().map((c) => (
        <CommentSection
          key={c.comment_id}
          comment={c}
          childrenComments={childrenComments}
          parent_id={c.comment_id}
          dispatch={dispatch}
          isAuthor={isAuthor}
          userId={userId}
        />
      ))}
    </CommentCard>
  )
}
