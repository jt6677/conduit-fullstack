import React, { createContext, useContext, Dispatch, useReducer } from 'react'
import {
  articlesReducer,
  initialState,
  ArticleListAction,
  ArticleListState,
} from '../reducers/articleList'

type ArticleListContextProps = {
  state: ArticleListState
  dispatch: Dispatch<ArticleListAction>
}

const ArticlesContext = createContext<ArticleListContextProps>({
  state: initialState,
  dispatch: () => initialState,
})

export function ArticlesProvider(
  props: React.PropsWithChildren<any>
): JSX.Element {
  const [state, dispatch] = useReducer(articlesReducer, initialState)
  return <ArticlesContext.Provider value={{ state, dispatch }} {...props} />
}

export default function useArticles(): ArticleListContextProps {
  const context = useContext(ArticlesContext)
  if (!context) {
    throw new Error(`useArticles must be used within an ArticlesProvider`)
  }
  return context
}
