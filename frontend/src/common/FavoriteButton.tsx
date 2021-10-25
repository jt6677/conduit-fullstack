import React from 'react'
import { IArticle } from '~/types'
import { ArticleAction } from '~/reducers/article'
import {
  ArticleListAction,
  ArticleListActionType,
} from '~/reducers/articleList'
import { favoriteArticle, unfavoriteArticle } from '~/api/ArticlesAPI'

type FavoriteButtonProps = {
  article: IArticle
  // dispatch: React.Dispatch<ArticleAction && ArticleListAction>
  dispatch: React.Dispatch<any>
  children: React.ReactNode
}

export default function FavoriteButton({
  article,
  dispatch,
  children,
}: FavoriteButtonProps): JSX.Element {
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setLoading(true)
    if (article.favorited) {
      const payload = await unfavoriteArticle(article.slug)
      dispatch({
        type: ArticleListActionType.ARTICLE_UNFAVORITED,
        payload: payload.data,
      })
    } else {
      const payload = await favoriteArticle(article.slug)
      dispatch({
        type: ArticleListActionType.ARTICLE_FAVORITED,
        payload: payload.data,
      })
    }
    setLoading(false)
  }

  const classNames = [
    ' bg-transparent text-center inline-block leading-4 border border-green-500 rounded px-2 py-1 ',
  ]

  if (article.favorited) {
    classNames.push('text-white bg-green-500 hover:bg-green-600  ')
  } else {
    classNames.push('text-green-500 hover:text-white hover:bg-green-500 ')
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={handleClick}
      disabled={loading}
    >
      <i className="ion-heart" />
      &nbsp;
      {children}
    </button>
  )
}
