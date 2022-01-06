import React, { Dispatch, useReducer } from 'react'

import { useFetch } from '~/context/FetchContext'
import {
  ArticleListAction,
  ArticleListState,
  articlesReducer,
  initialState,
} from '~/reducers/articleList'
import { IArticle, IComment } from '~/types'
import { createCtx } from '~/utils/utils'

interface ArticlesContextProps {
  state: ArticleListState
  dispatch: Dispatch<ArticleListAction>
  fetchArticle: (slug: string) => Promise<IArticle>
  fetchAllArticles: () => Promise<IArticle[]>
  fetchMyArticles: () => Promise<IArticle[]>
  postArticle: (data: any) => Promise<string>
  updateArticle: (slug: string, data: any) => Promise<string>
  deleteArticle: (slug: string) => Promise<string>
  favoriteArticle: (slug: string) => Promise<IArticle>
  unfavoriteArticle: (slug: string) => Promise<IArticle>
  fetchComments: (articleId: string) => Promise<IComment[]>
  postComment(articleId: string, body: string, parentId: string): Promise<IComment>
  deleteComment(articleId: string, commentId: string): Promise<string>
}
export const [useArticles, CtxProvider] = createCtx<ArticlesContextProps>()

export function ArticlesProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [state, dispatch] = useReducer(articlesReducer, initialState)
  const { authAxios } = useFetch()
  function fetchArticle(slug: string): Promise<IArticle> {
    // console.log('object', slug)
    // const url = `/articles/${slug}`
    return authAxios.get<IArticle>(`/article/${slug}`).then((response) => response.data)
    // return authAxios.get<IArticle>(`article/${slug}`).then((response) => response.data)
  }
  function fetchAllArticles(): Promise<IArticle[]> {
    return authAxios
      .get<Array<IArticle>>('/articles/all')
      .then((response) => response.data)
  }

  function fetchMyArticles(): Promise<IArticle[]> {
    return authAxios
      .get<Array<IArticle>>('/articles/myfeed')
      .then((response) => response.data)
  }
  function postArticle(data: any): Promise<string> {
    return authAxios
      .post<string>(`/articles`, { ...data })
      .then((response) => response.data)
  }
  function updateArticle(slug: string, data: any): Promise<string> {
    return authAxios
      .put<string>(`/article/${slug}`, { ...data })
      .then((response) => response.data)
  }
  function deleteArticle(slug: string): Promise<string> {
    return authAxios.delete<string>(`/article/${slug}`).then((response) => response.data)
  }
  function favoriteArticle(slug: string): Promise<IArticle> {
    return authAxios
      .post<IArticle>(`/article/${slug}/favorite`)
      .then((response) => response.data)
  }
  function unfavoriteArticle(slug: string): Promise<IArticle> {
    return authAxios
      .delete<IArticle>(`/article/${slug}/unfavorite`)
      .then((response) => response.data)
  }
  function fetchComments(articleId: string): Promise<IComment[]> {
    return authAxios
      .post<IComment[]>(`/comments/get`, { article_Id: articleId })
      .then((response) => {
        if (response.data) {
          return response.data
        }
        return []
      })
  }
  function postComment(
    articleId: string,
    body: string,
    parentId: string
  ): Promise<IComment> {
    return authAxios
      .post<IComment>(`/comments/post`, {
        article_id: articleId,
        body,
        parent_id: parentId,
      })
      .then((response) => response.data)
  }
  function deleteComment(articleId: string, commentId: string): Promise<string> {
    return authAxios
      .post<string>(`/comments/delete`, {
        article_id: articleId,
        comment_id: commentId,
      })
      .then((response) => response.data)
  }

  return (
    <CtxProvider
      value={{
        state,
        dispatch,
        fetchArticle,
        fetchAllArticles,
        fetchMyArticles,
        postArticle,
        updateArticle,
        deleteArticle,
        favoriteArticle,
        unfavoriteArticle,
        fetchComments,
        postComment,
        deleteComment,
      }}
      {...props}
    />
  )
}
