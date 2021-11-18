import { AxiosResponse } from 'axios'
import marked from 'marked'
import React from 'react'
import { Link, RouteProps, useParams } from 'react-router-dom'

import { FavButton } from '~/common/FavoriteButton'
import { useArticles } from '~/context/ArticlesContext'
import { useAuth } from '~/context/AuthContext'
import { ArticleActionType, articleReducer, initialState } from '~/reducers/article'
import { IArticle, IComment } from '~/types'
import { ALT_IMAGE_URL } from '~/utils/utils'

export default function Article(_: RouteProps): JSX.Element | null {
  const [{ article, comments, loading, error }, dispatch] = React.useReducer(
    articleReducer,
    initialState
  )
  const { dispatch: articlesDispatch, fetchArticle } = useArticles()
  const { slug } = useParams<{ slug: string }>()
  const {
    state: { user },
  } = useAuth()
  React.useEffect(() => {
    dispatch({ type: ArticleActionType.FETCH_ARTICLE_BEGIN })
    let ignore = false
    const cc: IComment[] = [
      {
        id: 1,
        createdAt: new Date('2016-02-18T03:22:56.637Z'),
        updatedAt: new Date('2016-02-18T03:22:56.637Z'),
        body: 'It takes a Jacobian',
        author: {
          username: 'jake',
          bio: 'I work at statefarm',
          image: 'https://i.stack.imgur.com/xHWG8.jpg',
          following: false,
        },
      },
      {
        id: 2,
        createdAt: new Date('2016-02-18T03:22:56.637Z'),
        updatedAt: new Date('2016-02-18T03:22:56.637Z'),
        body: 'It takes a Jacobian',
        author: {
          username: 'jake',
          bio: 'I work at statefarm',
          image: 'https://i.stack.imgur.com/xHWG8.jpg',
          following: false,
        },
      },
    ]

    const getArticle = async () => {
      try {
        const data = await fetchArticle(slug)
        if (!ignore) {
          dispatch({
            type: ArticleActionType.FETCH_ARTICLE_SUCCESS,
            payload: {
              article: data,
              comments: cc,
            },
          })
        }
      } catch (err) {
        if (err && typeof err === 'string') {
          dispatch({
            type: ArticleActionType.FETCH_ARTICLE_ERROR,
            error: err,
          })
        }
      }
    }

    getArticle().catch((err) => console.log(err))

    return () => {
      ignore = true
    }
  }, [dispatch, slug])
  const convertToMarkdown = (text: string) => ({
    __html: marked(text, { sanitize: true }),
  })

  return (
    article && (
      <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
        <div className="col-span-2 col-start-2 mt-12">
          <div className="overflow-hidden bg-white sm:rounded-lg sm:shadow">
            <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6 ">
              <div className="grid grid-cols-5 -mt-2 sm:flex-nowrap">
                {/* <div className="flex items-center justify-between -mt-2 sm:flex-nowrap"> */}
                <div className="col-span-1">
                  <div className="flex items-center ">
                    <div className="flex-shrink-0 float-right">
                      <img
                        className="w-12 h-12 rounded-full"
                        src={article.author.image || ALT_IMAGE_URL}
                        alt={article.author.username}
                      />
                    </div>
                    <div className="ml-2">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {article.author.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        <Link
                          to={`/profiles/${article.author.username}`}>{`@${article.author.username}`}</Link>
                      </p>
                    </div>
                  </div>
                </div>
                <h1 className="col-span-3 m-auto text-2xl font-semibold">
                  {article.title}
                </h1>
                {user && (
                  <div className="col-span-1 ml-auto ">
                    <FavButton article={article} dispatch={articlesDispatch} />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 opacity-25 sm:px-6 sm:pt-0">
              <p>{article.description}</p>
            </div>
            <div className="mt-2 opacity-75 sm:p-6 sm:pt-0">
              <p>{article.body}</p>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
