import { Formik, FormikState } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import { useArticles } from '~/context/ArticlesContext'
import { ArticleAction, ArticleActionType } from '~/reducers/article'
import { IComment } from '~/types'

interface CommentInputBoxProps {
  articleId: string
  parentId?: string
  rowsOfInputArea?: number
  avatarSize?: number
  dispatch: React.Dispatch<ArticleAction>
  setToggleReply?: React.Dispatch<React.SetStateAction<boolean>>
}

export function CommentInputBox({
  articleId,
  dispatch,
  parentId = 'root',
  rowsOfInputArea = 3,
  avatarSize = 10,
  setToggleReply,
}: CommentInputBoxProps) {
  const [loading, setLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState<string | null>()
  const [isError, setIsError] = React.useState<string | null>()
  const { postComment, deleteComment } = useArticles()
  const handleSubmit = async (
    { body }: { body: string },
    resetForm: (
      nextState?:
        | Partial<
            FormikState<{
              body: string
            }>
          >
        | undefined
    ) => void
  ) => {
    setIsError(null)
    setLoading(true)
    try {
      const newComment = await postComment(articleId, body, parentId)
      dispatch({
        type: ArticleActionType.ADD_COMMENT,
        payload: {
          comment: newComment,
        },
      })
      // clear input
      resetForm()
      if (setToggleReply) setToggleReply(false)
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div className="flex items-start w-full space-x-4 ">
      <div className="flex-shrink-0">
        <img
          className={`inline-block w-${avatarSize} h-${avatarSize} rounded-full`}
          src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
        />
      </div>
      <div className="flex-1 min-w-0">
        <Formik
          enableReinitialize
          initialValues={{
            body: '',
            // body: comment?.body || '',
          }}
          validationSchema={Yup.object({
            body: Yup.string().required('Required'),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setSubmitting(false)
            handleSubmit(values, resetForm)
          }}>
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <div className="border-b border-gray-200 focus-within:border-indigo-600">
                <label htmlFor="comment" className="sr-only">
                  Add your comment
                </label>
                <textarea
                  id="body"
                  autoFocus
                  rows={rowsOfInputArea}
                  {...formik.getFieldProps('body')}
                  className="block w-full p-0 pb-2 border-0 border-b border-transparent resize-none focus:ring-0 focus:border-indigo-600 sm:text-sm"
                  placeholder="Add your comment..."
                />
              </div>
              <div className="flex justify-between pt-2">
                <div className="flex-shrink-0">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Post
                  </button>
                </div>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}
