import React from 'react'
import { useHistory } from 'react-router-dom'
import { IArticle } from '~/types'
import { deleteArticle } from '~/api/ArticlesAPI'

export default function DeleteButton({ article }: { article: IArticle }) {
  let history = useHistory()
  const handleDelete = async () => {
    try {
      await deleteArticle(article.slug)
      history.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
      <i className="ion-trash-a" /> Delete Article
    </button>
  )
}
