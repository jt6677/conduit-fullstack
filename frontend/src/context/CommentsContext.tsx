import React, { Dispatch, useReducer } from 'react'

import { useFetch } from '~/context/FetchContext'
import {
  ArticleListAction,
  ArticleListState,
  articlesReducer,
  initialState,
} from '~/reducers/articleList'
import { IComment } from '~/types'
import { createCtx } from '~/utils/utils'

type CommentsContextProps = {
  state: ArticleListState
  dispatch: Dispatch<ArticleListAction>
  fetchComments: (articleId: string) => Promise<IComment[]>
  postComment(articleId: string, body: string, parentId: string): Promise<IComment>
  deleteComment(commentId: string): Promise<string>
}
export const [useComments, CtxProvider] = createCtx<CommentsContextProps>()

export function CommentsProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const { authAxios } = useFetch()

  function fetchComments(articleId: string): Promise<IComment[]> {
    return authAxios
      .post<IComment[]>(`/comments/get`, { article_Id: articleId })
      .then((response) => response.data)
  }
  function deleteComment(commentId: string): Promise<string> {
    return authAxios
      .post<string>(`/comments/delete`, {
        commentId,
      })
      .then((response) => response.data)
  }

  return (
    <CtxProvider
      value={{
        fetchComments,
        // postComment,
        deleteComment,
      }}
      {...props}
    />
  )
}
