import React from 'react'

import ArticleAvatar from '~/common/ArticleAvatar'
import { ArticleAction } from '~/reducers/article'
import ArticleActions from '~/screen/article/ArticleActions'
import { IArticle } from '~/types'

type ArticleMetaProps = {
  article: IArticle
  dispatch: React.Dispatch<ArticleAction>
}

function ArticleMeta({ article, dispatch }: ArticleMetaProps) {
  return (
    <div className="article-meta">
      <ArticleAvatar article={article} />
      <ArticleActions article={article} dispatch={dispatch} />
    </div>
  )
}

export default React.memo(ArticleMeta)
