import React from 'react'
import ArticlePreview from './ArticlePreview'
// import ListPagination from './ListPagination'
import {
  getArticles,
  getFeedArticles,
  getArticlesByTag,
  getArticlesByAuthor,
  getArticlesFavoritedBy,
} from './api/ArticlesAPI'
import useArticles from './context/articles'

import { ITab, ITabType, ArticleListActionType } from './reducers/articleList'

const loadArticles = (tab: ITab, page = 0) => {
  switch (tab.type) {
    case ITabType.FEED:
      return getFeedArticles()
    case ITabType.ALL:
      // console.log('getArticles')
      return getArticles(page)
    case ITabType.TAG:
      return getArticlesByTag(tab.label, page)
    case ITabType.AUTHORED:
      return getArticlesByAuthor(tab.username, page)
    case ITabType.FAVORITES:
      return getArticlesFavoritedBy(tab.username, page)
    default:
      // return getArticles(page);
      throw new Error('type does not exist')
  }
}

export default function ArticleList(): JSX.Element {
  const {
    state: { articles, loading, error, articlesCount, selectedTab, page },
    dispatch,
  } = useArticles()

  React.useEffect(() => {
    let ignore = false
    async function fetchArticles() {
      dispatch({ type: ArticleListActionType.FETCH_ARTICLES_BEGIN })
      try {
        const payload = await loadArticles(selectedTab, page)
        if (!ignore) {
          dispatch({
            type: ArticleListActionType.FETCH_ARTICLES_SUCCESS,
            payload: payload.data,
          })
        }
      } catch (err) {
        if (!ignore) {
          dispatch({
            type: ArticleListActionType.FETCH_ARTICLES_ERROR,
            error: `${err}`,
          })
        }
      }
    }
    fetchArticles().catch((err) => {
      console.log(err)
    })
    return () => {
      ignore = true
    }
  }, [dispatch, page, selectedTab])

  // console.log('asd', articles)
  if (loading) {
    return <div className="py-6">Loading...</div>
  }

  if (articles.length === 0) {
    return <div className="py-6">No articles are here... yet.</div>
  }
  return (
    <>
      {articles.map((article) => (
        <ArticlePreview
          key={article.slug}
          article={article}
          dispatch={dispatch}
        />
      ))}
      {/* <ListPagination
        page={page}
        articlesCount={articlesCount}
        dispatch={dispatch}
      /> */}
    </>
  )
}
