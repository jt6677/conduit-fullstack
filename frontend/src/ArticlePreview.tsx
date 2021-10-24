import React from 'react'
import { Link } from 'react-router-dom'
import ArticleAvatar from './common/ArticleAvatar'
import ArticleTags from './common/ArticleTags'
import FavoriteButton from './common/FavoriteButton'
import { IArticle } from './types'
import { ArticleListAction } from './reducers/articleList'
import { ALT_IMAGE_URL } from './utils/utils'
type ArticlePreviewProps = {
  article: IArticle
  dispatch: React.Dispatch<ArticleListAction>
}

export default function ArticlePreview({
  article,
  dispatch,
}: ArticlePreviewProps): JSX.Element {
  return (
    <div
      key={article.title}
      className="flex flex-col overflow-hidden rounded-lg shadow-lg"
    >
      <div className="flex flex-col justify-between flex-1 p-6 bg-white">
        <div className="flex-1">
          {/* <p className="text-sm font-medium text-indigo-600">
            <a href={post.category.href} className="hover:underline">
              {post.category.name}
            </a>
          </p> */}
          <Link to={`/article/${article.slug}`} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">
              {article.title}
            </p>
            <p className="mt-3 text-base text-gray-500">
              {article.description}
            </p>
          </Link>
        </div>
        <div className="flex items-center mt-6">
          <div className="flex-shrink-0">
            <Link to={`/profiles/${article.author.username}`}>
              <span className="sr-only">{article.author.username}</span>
              <img
                className="w-10 h-10 rounded-full"
                src={article.author.image || ALT_IMAGE_URL}
                alt={article.author.username}
              />
            </Link>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              <Link
                to={`/profiles/${article.author.username}`}
                className="hover:underline"
              >
                {article.author.username}
              </Link>
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={`${article.created_at}`}>
                {`${article.created_at}`.substring(0, 10)}
              </time>
              <span className="pl-8">{'   '} 5 min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
