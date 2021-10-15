import React from 'react'
import { Link } from 'react-router-dom'
import ArticleAvatar from './common/ArticleAvatar'
import ArticleTags from './common/ArticleTags'
import FavoriteButton from './common/FavoriteButton'
import { IArticle } from './types'
import { ArticleListAction } from './reducers/articleList'

type ArticlePreviewProps = {
  article: IArticle
  dispatch: React.Dispatch<ArticleListAction>
}

export default function ArticlePreview({
  article,
  dispatch,
}: ArticlePreviewProps): JSX.Element {
  return (
    <div className="py-6 border-b-2 border-gray-100">
      <div className="mb-4">
        <ArticleAvatar article={article} />
        <div className="float-right">
          <FavoriteButton article={article} dispatch={dispatch}>
            {article.favoritesCount}
          </FavoriteButton>
        </div>
      </div>

      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1 className="mb-1 text-2xl font-semibold">{article.title}</h1>
        <p className="mb-4 text-xl font-light text-gray-400">
          {article.description}
        </p>
        <span className="text-base font-light text-gray-400 align-middle">
          Read more...
        </span>
        <ArticleTags tagList={article.tagList} />
      </Link>
    </div>
  )
}
