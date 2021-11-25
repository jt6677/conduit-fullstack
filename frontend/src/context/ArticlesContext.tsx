import React, { Dispatch, useReducer } from 'react'

import { useFetch } from '~/context/FetchContext'
import {
  ArticleListAction,
  ArticleListState,
  articlesReducer,
  initialState,
} from '~/reducers/articleList'
import { IArticle } from '~/types'
import { createCtx } from '~/utils/utils'

type ArticleListContextProps = {
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
}
export const [useArticles, CtxProvider] = createCtx<ArticleListContextProps>()

export function ArticlesProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [state, dispatch] = useReducer(articlesReducer, initialState)
  const { authAxios } = useFetch()
  function fetchArticle(slug: string): Promise<IArticle> {
    return authAxios.get<IArticle>(`/article/${slug}`).then((response) => response.data)
  }
  function fetchAllArticles(): Promise<IArticle[]> {
    return authAxios
      .get<Array<IArticle>>('articles/all')
      .then((response) => response.data)
  }

  function fetchMyArticles(): Promise<IArticle[]> {
    return authAxios
      .get<Array<IArticle>>('articles/myfeed')
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
      }}
      {...props}
    />
  )
}

// export default function useArticles(): ArticleListContextProps {
//   const context = useContext(ArticlesContext)
//   if (!context) {
//     throw new Error(`useArticles must be used within an ArticlesProvider`)
//   }
//   return context
// }
