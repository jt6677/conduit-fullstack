import React from 'react'
import marked from 'marked'
import { useParams, RouteProps } from 'react-router-dom'
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
      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{article.title}</h1>
            <ArticleMeta article={article} dispatch={dispatch} />
          </div>
        </div>

        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <p dangerouslySetInnerHTML={convertToMarkdown(article.body)} />
              <ArticleTags tagList={article.tagList} />
            </div>
          </div>

          <hr />

          <div className="article-actions">
            <ArticleMeta article={article} dispatch={dispatch} />
          </div>

          <CommentContainer
            comments={comments}
            slug={slug}
            dispatch={dispatch}
          />
        </div>
      </div>
    )
  )
}
