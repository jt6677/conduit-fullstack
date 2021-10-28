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
  getArticle: (slug: string) => Promise<IArticle>
  postArticle: (data: any) => Promise<string>
}

// const ArticlesContext = createContext<ArticleListContextProps>({
//   state: initialState,
//   dispatch: () => initialState,
// })

//  payload = await authClient(`articles`, {
//    method: 'POST',
//    data: { ...article },
//  })
export const [useArticles, CtxProvider] = createCtx<ArticleListContextProps>()

export function ArticlesProvider(
  props: React.PropsWithChildren<any>
): JSX.Element {
  const [state, dispatch] = useReducer(articlesReducer, initialState)
  const { authAxios } = useFetch()
  function getArticle(slug: string): Promise<IArticle> {
    return authAxios
      .get<IArticle>(`/article/${slug}`)
      .then((response) => response.data)
  }
  function postArticle(data: any): Promise<string> {
    return authAxios
      .post<string>(`/articles`, { ...data })
      .then((response) => response.data)
  }
  return (
    <CtxProvider
      value={{ state, dispatch, getArticle, postArticle }}
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
