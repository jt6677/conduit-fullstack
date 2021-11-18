import React from 'react'

import {
  getArticles,
  getArticlesByAuthor,
  getArticlesByTag,
  getArticlesFavoritedBy,
  getFeedArticles,
} from '~/api/ArticlesAPI'
import { useArticles } from '~/context/ArticlesContext'
import { ITab, ITabType } from '~/reducers/articleList'
import ArticlePreview from '~/screen/article/ArticlePreview'
import { IArticle } from '~/types'

const loadArticles = (tab: ITab, page = 0) => {
  switch (tab.type) {
    case ITabType.FEED:
      return getFeedArticles()
    case ITabType.ALL:
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
    state: { loading, error, articlesCount, selectedTab, page },
    dispatch,
    fetchAllArticles,
    fetchMyArticles,
  } = useArticles()
  const [articles, setArticles] = React.useState<Array<IArticle> | null>()
  React.useEffect(() => {
    let ignore = false
    async function fetchArticles() {
      try {
        let data
        if (selectedTab.type === ITabType.ALL) {
          data = await fetchAllArticles()
          if (!ignore) {
            if (data) {
              setArticles(data)
            } else {
              setArticles(null)
            }
          }
        }
        if (selectedTab.type === ITabType.FEED) {
          data = await fetchMyArticles()
          if (!ignore) {
            if (data) {
              setArticles(data)
            } else {
              setArticles(null)
            }
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchArticles()
    return () => {
      ignore = true
    }
  }, [dispatch, page, selectedTab])

  if (loading) {
    return <div className="py-6">Loading...</div>
  }
  if (error) {
    return <div className="py-6">{error}</div>
  }

  if (articles) {
    return (
      <div className="relative px-4 pt-2 pb-20 sm:px-6 lg:pt-2 lg:pb-28 lg:px-8">
        <div className="absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid max-w-lg gap-5 mx-auto mt-8 lg:grid-cols-2 lg:max-w-none">
            {articles.map((article) => (
              <ArticlePreview key={article.slug} article={article} dispatch={dispatch} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  return <div className="py-6">No articles are here... yet.</div>
}
