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

// function classNames(...classes: any) {
//   return classes.filter(Boolean).join(' ')
// }

export default function ArticleList() {
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
  if (error) {
    return <div className="py-6">{error}</div>
  }

  // if (articles.length === 0) {
  //   return <div className="py-6">No articles are here... yet.</div>
  // }
  if (articles) {
    return (
      <div className="relative px-4 pt-2 pb-20 sm:px-6 lg:pt-2 lg:pb-28 lg:px-8">
        <div className="absolute inset-0"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid max-w-lg gap-5 mx-auto mt-12 lg:grid-cols-3 lg:max-w-none">
            {articles.map((article) => (
              <ArticlePreview
                key={article.slug}
                article={article}
                dispatch={dispatch}
              />
            ))}
          </div>
        </div>
      </div>
    )
  } else {
    return <div className="py-6">No articles are here... yet.</div>
  }
}
