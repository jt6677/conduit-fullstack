import React from 'react'
import { useHistory } from 'react-router-dom'

import { deleteArticle } from '~/api/ArticlesAPI'
import { IArticle } from '~/types'

export default function DeleteButton({ article }: { article: IArticle }) {
  const history = useHistory()
  const handleDelete = async () => {
    try {
      await deleteArticle(article.slug)
      history.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <button
      className="btn btn-outline-danger btn-sm"
      onClick={handleDelete}
      type="button">
      <i className="ion-trash-a" /> Delete Article
    </button>
  )
}
