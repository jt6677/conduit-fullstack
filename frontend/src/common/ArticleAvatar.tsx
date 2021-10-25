import React from 'react'
import { Link } from 'react-router-dom'
import { IArticle } from '~/types'
import { ALT_IMAGE_URL } from '~/utils/utils'

type ArticleAvatarProps = {
  article: IArticle
}

export default function ArticleAvatar({
  //@ts-ignore
  article: { author, createdAt },
}: ArticleAvatarProps) {
  return (
    <>
      <Link to={`/${author.username}`}>
        <img
          className="inline-block w-8 h-8 align-middle rounded-full"
          src={author.image || ALT_IMAGE_URL}
          alt={author.username}
        />
      </Link>

      <div
        className="inline-block leading-4 align-middle "
        style={{ margin: '0 1.5rem 0 0.3rem' }}
      >
        <Link
          className="block font-medium text-green-500 hover:underline"
          to={`/${author.username}`}
        >
          {author.username}
        </Link>
        <span className="block text-xs font-light text-gray-500">
          {new Date(createdAt).toDateString()}
        </span>
      </div>
    </>
  )
}
