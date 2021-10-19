import React from 'react'
import marked from 'marked'
import { useParams, RouteProps, Link } from 'react-router-dom'
import ArticleMeta from './ArticleMeta'
import ArticleTags from '../../common/ArticleTags'
import CommentContainer from './CommentContainer'
import {
  articleReducer,
  initialState,
  ArticleActionType,
} from '../../reducers/article'
import { getArticleComments } from '../../api/CommentsAPI'
import { getArticle } from '../../api/ArticlesAPI'
import { IComment, IArticle } from '../../types'
import { ALT_IMAGE_URL } from '../../utils/utils'

export default function Article(_: RouteProps): JSX.Element | null {
  const [{ article, comments, loading, error }, dispatch] = React.useReducer(
    articleReducer,
    initialState
  )
  let { slug } = useParams<{ slug: string }>()

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

    const fetchArticle = async () => {
      try {
        const [articlePayload, commentsPayload] = await Promise.all([
          getArticle(slug),
          getArticleComments(slug),
        ])
        console.log(articlePayload.data)

        if (!ignore) {
          dispatch({
            type: ArticleActionType.FETCH_ARTICLE_SUCCESS,
            payload: {
              article: articlePayload.data,
              // article: articlePayload.data.article,
              comments: cc,
              // comments: commentsPayload.data.comments,
            },
          })
        }
      } catch (err) {
        console.log(err)
        if (err && typeof err === 'string') {
          dispatch({
            type: ArticleActionType.FETCH_ARTICLE_ERROR,
            error: err,
          })
        }
      }
    }

    fetchArticle().catch((err) => console.log(err))

    return () => {
      ignore = true
    }
  }, [dispatch, slug])
  console.log(article)
  const convertToMarkdown = (text: string) => ({
    __html: marked(text, { sanitize: true }),
  })

  return (
    article && (
      <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
        <div className="col-span-2 col-start-2 mt-12">
          <div className="overflow-hidden bg-white sm:rounded-lg sm:shadow">
            <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6 ">
              <div className="grid grid-cols-6 gap-1 -mt-4 -ml-4 sm:flex-nowrap">
                {/* avatar */}
                <div className="flex items-center mt-4 ml-4 ">
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
                        to={`/profile/${article.author.username}`}
                      >{`@${article.author.username}`}</Link>
                    </p>
                  </div>
                </div>
                {/* <h1 className="text-xl text-bold">xaasdasda!</h1> */}
                {/* article Title  */}
                <h1 className="flex items-center justify-center col-span-4 col-start-2 mt-4 ml-4 text-2xl font-semibold">
                  {article.title}
                </h1>
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
