import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { format } from 'timeago.js'

import { useArticles } from '~/context/ArticlesContext'
import { ArticleAction, ArticleActionType } from '~/reducers/article'
import { IComment } from '~/types'

import { CommentInputBox } from './comment_inputbox'

export interface CommentProps {
  children?: React.ReactNode
  comment: IComment
  dispatch: React.Dispatch<ArticleAction>
  isAuthor: boolean
  userId?: string
}

const CommentCard: React.FC<CommentProps> = ({
  comment,
  children,
  dispatch,
  isAuthor,
  userId,
  ...otherProps
}: CommentProps) => {
  const { deleteComment } = useArticles()
  const [toggleReply, setToggleReply] = React.useState(false)
  const renderNested = (nestedChildren: any) => (
    <div className="ml-8">{nestedChildren}</div>
  )
  const handleDelete = async () => {
    try {
      const data = await deleteComment(comment.article_id, comment.comment_id)
      if (data) {
        dispatch({
          type: ArticleActionType.DELETE_COMMENT,
          commentId: comment.comment_id,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div {...otherProps}>
      <div className="flex space-x-2 text-sm text-gray-500">
        <div className="flex-none py-2">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80"
            alt=""
            className="w-8 h-8 bg-gray-100 rounded-full"
          />
        </div>
        <div className="flex-1 py-2 text-gray-500 ">
          <div className="flex items-center">
            <h3 className="font-semibold text-blue-400">{comment.author.username}</h3>
            <p className="ml-1 text-xs">
              <time dateTime={comment.created_at}>{format(comment.created_at)}</time>
            </p>
          </div>
          <div className="my-1 text-base text-gray-700 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {comment.body}
            </ReactMarkdown>
          </div>
          <button
            type="button"
            onClick={() => setToggleReply(!toggleReply)}
            className="inline-flex items-center  px-1 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Reply
          </button>
          {(isAuthor || userId === comment.author.user_id) && (
            <button
              type="button"
              onClick={() => handleDelete()}
              className="inline-flex ml-1 items-center  px-1 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Delete
            </button>
          )}

          {toggleReply && (
            <div className="pt-2">
              <CommentInputBox
                dispatch={dispatch}
                articleId={comment.article_id}
                parentId={comment.comment_id}
                rowsOfInputArea={1}
                avatarSize={8}
                setToggleReply={setToggleReply}
              />
            </div>
          )}
        </div>
      </div>
      {children ? renderNested(children) : null}
    </div>
  )
}

export default CommentCard
