import classNames from 'classnames'
import React from 'react'

import { useArticles } from '~/context/ArticlesContext'
import { ArticleAction } from '~/reducers/article'
import { ArticleListAction, ArticleListActionType } from '~/reducers/articleList'
import { IArticle } from '~/types'

type FavoriteButtonProps = {
  article: IArticle
  // dispatch: React.Dispatch<ArticleAction && ArticleListAction>
  dispatch: React.Dispatch<any>
  // children: React.ReactNode
}

export const FavButton = ({
  article,
  dispatch,
}: FavoriteButtonProps & React.HTMLAttributes<HTMLDivElement>): JSX.Element => {
  const { favoriteArticle, unfavoriteArticle } = useArticles()
  const [animate, setAnimate] = React.useState(article.favorited)
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setAnimate(!animate)
    setLoading(true)
    if (article.favorited) {
      const payload = await unfavoriteArticle(article.slug)
      dispatch({
        type: ArticleListActionType.ARTICLE_UNFAVORITED,
        payload,
      })
    } else {
      const payload = await favoriteArticle(article.slug)
      dispatch({
        type: ArticleListActionType.ARTICLE_FAVORITED,
        payload,
      })
    }
    setLoading(false)
  }

  return (
    <div
      className={classNames('like', animate && 'active')}
      onClick={handleClick}
      onKeyPress={handleClick}
      role="button">
      <div className="icon">
        <svg viewBox="0 0 24 24">
          <path d="M2.9219 12.4463C1.8489 9.0963 3.1039 4.9313 6.6209 3.7993C8.4709 3.2023 10.7539 3.7003 12.0509 5.4893C13.2739 3.6343 15.6229 3.2063 17.4709 3.7993C20.9869 4.9313 22.2489 9.0963 21.1769 12.4463C19.5069 17.7563 13.6799 20.5223 12.0509 20.5223C10.4229 20.5223 4.6479 17.8183 2.9219 12.4463Z" />
        </svg>
      </div>
      <div className="shadow" />
      <div className="number">232</div>
    </div>
  )
}
