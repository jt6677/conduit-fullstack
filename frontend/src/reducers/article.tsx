import { IArticle, IComment } from '~/types'

export enum ArticleActionType {
  FETCH_ARTICLE_BEGIN = 'FETCH_ARTICLE_BEGIN',
  FETCH_ARTICLE_SUCCESS = 'FETCH_ARTICLE_SUCCESS',
  FETCH_ARTICLE_ERROR = 'FETCH_ARTICLE_ERROR',
  ARTICLE_FAVORITED = 'ARTICLE_FAVORITED',
  ARTICLE_UNFAVORITED = 'ARTICLE_UNFAVORITED',
  ADD_COMMENT = 'ADD_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
  FOLLOW_AUTHOR = 'FOLLOW_AUTHOR',
  UNFOLLOW_AUTHOR = 'UNFOLLOW_AUTHOR',
}
export type ArticleAction =
  | { type: ArticleActionType.FETCH_ARTICLE_BEGIN }
  | {
      type: ArticleActionType.FETCH_ARTICLE_SUCCESS
      payload: { article: IArticle; comments: IComment[] }
    }
  | { type: ArticleActionType.FETCH_ARTICLE_ERROR; error: string }
  | {
      type: ArticleActionType.ARTICLE_FAVORITED
      payload: { article: IArticle }
    }
  | {
      type: ArticleActionType.ARTICLE_UNFAVORITED
      payload: { article: IArticle }
    }
  | { type: ArticleActionType.ADD_COMMENT; payload: { comment: IComment } }
  | { type: ArticleActionType.DELETE_COMMENT; commentId: number }
  | { type: ArticleActionType.FOLLOW_AUTHOR }
  | { type: ArticleActionType.UNFOLLOW_AUTHOR }

export interface ArticleState {
  article: IArticle | null
  comments: Array<IComment>
  loading: boolean
  error: string | null
}

export const initialState: ArticleState = {
  article: null,
  comments: [],
  loading: false,
  error: null,
}

export function articleReducer(state: ArticleState, action: ArticleAction): ArticleState {
  switch (action.type) {
    case ArticleActionType.FETCH_ARTICLE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case ArticleActionType.FETCH_ARTICLE_SUCCESS:
      return {
        ...state,
        loading: false,
        article: action.payload.article,
        comments: action.payload.comments,
      }
    case ArticleActionType.FETCH_ARTICLE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
        article: null,
      }
    case ArticleActionType.ARTICLE_FAVORITED:
    case ArticleActionType.ARTICLE_UNFAVORITED:
      return {
        ...state,
        article: state.article && {
          ...state.article,
          favorited: action.payload.article.favorited,
          favoritesCount: action.payload.article.favoritesCount,
        },
      }
    case ArticleActionType.ADD_COMMENT:
      return {
        ...state,
        comments: [action.payload.comment, ...state.comments],
      }
    case ArticleActionType.DELETE_COMMENT:
      return {
        ...state,
        comments: state.comments.filter((comment) => comment.id !== action.commentId),
      }
    case ArticleActionType.FOLLOW_AUTHOR:
    case ArticleActionType.UNFOLLOW_AUTHOR:
      return {
        ...state,
        article: state.article && {
          ...state.article,
          author: {
            ...state.article.author,
            following: !state.article.author.following,
          },
        },
      }
    default:
      return state
  }
}
