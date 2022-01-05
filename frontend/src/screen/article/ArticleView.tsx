import { PencilAltIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, RouteProps, useHistory, useParams } from 'react-router-dom'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

// import * as sanitizeHtml from 'sanitize-html'
import { FavButton } from '~/common/FavoriteButton'
import ButtonWithIcon from '~/components/button_with_icon'
import { CommentInputBox } from '~/components/comment/comment_inputbox'
import { Comments } from '~/components/comment/comments'
import { useArticles } from '~/context/ArticlesContext'
import { useAuth } from '~/context/AuthContext'
import { ArticleActionType, articleReducer, initialState } from '~/reducers/article'
import { ALT_IMAGE_URL } from '~/utils/utils'

export default function Article(_: RouteProps): JSX.Element | null {
  const [{ article, comments, commentsOrder, loading, error }, dispatch] =
    React.useReducer(articleReducer, initialState)
  const { dispatch: articlesDispatch, fetchArticle, fetchComments } = useArticles()
  const { slug } = useParams<{ slug: string }>()
  const {
    state: { user },
  } = useAuth()

  const history = useHistory()
  React.useEffect(() => {
    dispatch({ type: ArticleActionType.FETCH_ARTICLE_BEGIN })
    let ignore = false

    const getArticlewithComments = async () => {
      try {
        const articleData = await fetchArticle(slug)
        const commentData = await fetchComments(articleData.article_id)

        if (!ignore) {
          dispatch({
            type: ArticleActionType.FETCH_ARTICLE_SUCCESS,
            payload: {
              article: articleData,
              comments: commentData,
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

    getArticlewithComments().catch((err) => console.log(err))

    return () => {
      ignore = true
    }
  }, [dispatch, slug])
  return (
    article && (
      <div className="z-10 min-h-screen bg-gray-100 ">
        <div className="flex flex-col ">
          <div className="grid grid-cols-6 pb-14 ">
            <div className="relative col-span-4 col-start-2 mt-12">
              <div className="overflow-hidden bg-white sm:rounded-lg sm:shadow">
                <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6 ">
                  <div className="grid grid-cols-5 -mt-2 sm:flex-nowrap">
                    <div className="flex items-center col-span-1 ">
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
                <div className="mt-2 break-all opacity-75 sm:p-6 sm:pt-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}>
                    {article.body}
                  </ReactMarkdown>
                </div>
              </div>
              {user?.user_id === article.author.user_id && (
                <div className="absolute right-0 pt-4 ">
                  <ButtonWithIcon
                    buttonName="Edit"
                    onClick={() => history.push(`/editor/${slug}`)}>
                    <PencilAltIcon />
                  </ButtonWithIcon>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-6 ">
            <div className="col-span-4 col-start-2 mt-2 ">
              <div className="px-4 py-5 overflow-hidden bg-white sm:rounded-lg sm:shadow ">
                <CommentInputBox articleId={article.article_id} dispatch={dispatch} />
                <div className="flex border-b border-gray-300 flex-end">
                  <div className="flex ml-auto space-x-2 text-sm ">
                    <div
                      className={classNames(
                        'hover:text-gray-500',
                        commentsOrder === 'newest' && 'font-semibold'
                      )}
                      role="button"
                      onClick={() =>
                        dispatch({ type: ArticleActionType.COMMENTS_NEWEST })
                      }>
                      Newest
                    </div>
                    <div
                      className={classNames(
                        'hover:text-gray-500',
                        commentsOrder === 'oldest' && 'font-semibold'
                      )}
                      role="button"
                      onClick={() =>
                        dispatch({ type: ArticleActionType.COMMENTS_OLDEST })
                      }>
                      Oldest
                    </div>
                  </div>
                </div>
                {comments && user && (
                  <>
                    <Comments
                      comments={comments}
                      isAuthor={user.user_id === article.author.user_id}
                      userId={user.user_id}
                      dispatch={dispatch}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <Comment2 /> */}
      </div>
    )
  )
}
