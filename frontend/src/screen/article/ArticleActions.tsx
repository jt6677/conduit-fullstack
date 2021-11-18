import React from 'react'
import { Link } from 'react-router-dom'

import { followProfile, unfollowProfile } from '~/api/ProfileAPI'
import { useAuth } from '~/context/AuthContext'
import { ArticleAction, ArticleActionType } from '~/reducers/article'
import DeleteButton from '~/screen/article/DeleteButton'
import { IArticle } from '~/types'

type ArticleActionsProps = {
  article: IArticle
  dispatch: React.Dispatch<ArticleAction>
}

export default function ArticleActions({ article, dispatch }: ArticleActionsProps) {
  const [loading, setLoading] = React.useState(false)
  const {
    state: { user },
  } = useAuth()

  const canModifyArticle = user && user.username === article.author.username

  const handleFollowButtonClick = async () => {
    setLoading(true)
    if (article.author.following) {
      await followProfile(article.author.username)
      dispatch({ type: ArticleActionType.UNFOLLOW_AUTHOR })
    } else {
      await unfollowProfile(article.author.username)
      dispatch({ type: ArticleActionType.FOLLOW_AUTHOR })
    }
    setLoading(false)
  }

  return canModifyArticle ? (
    <>
      <Link to={`/editor/${article.slug}`} className="btn btn-outline-secondary btn-sm">
        <i className="ion-edit" /> Edit Article
      </Link>
      <DeleteButton article={article} />
    </>
  ) : (
    <>
      {/* <FollowUserButton
        onClick={handleFollowButtonClick}
        profile={article.author}
        loading={loading}
      /> */}
      {/* <FavoriteButton article={article} dispatch={dispatch}>
        {article.favorited ? 'Unfavorite Article' : 'Favorite Article'}
        <span className="counter">({article.favoritesCount})</span>
      </FavoriteButton> */}
    </>
  )
}
