import { IArticle } from '~/types'

export enum ArticleListActionType {
  FETCH_ARTICLES_BEGIN = 'FETCH_ARTICLES_BEGIN',
  FETCH_ARTICLES_SUCCESS = 'FETCH_ARTICLES_SUCCESS',
  FETCH_ARTICLES_ERROR = 'FETCH_ARTICLES_ERROR',
  ARTICLE_FAVORITED = 'ARTICLE_FAVORITED',
  ARTICLE_UNFAVORITED = 'ARTICLE_UNFAVORITED',
  SET_TAB = 'SET_TAB',
  SET_PAGE = 'SET_PAGE',
}
export type ArticleListAction =
  | { type: ArticleListActionType.FETCH_ARTICLES_BEGIN }
  | {
      type: ArticleListActionType.FETCH_ARTICLES_SUCCESS
      payload: { articles: Array<IArticle> }
    }
  | { type: ArticleListActionType.FETCH_ARTICLES_ERROR; error: string }
  | {
      type: ArticleListActionType.ARTICLE_FAVORITED
      payload: { article: IArticle }
    }
  | {
      type: ArticleListActionType.ARTICLE_UNFAVORITED
      payload: { article: IArticle }
    }
  | { type: ArticleListActionType.SET_TAB; tab: ITab }
  | { type: ArticleListActionType.SET_PAGE; page: number }

export enum ITabType {
  ALL = 'ALL',
  FEED = 'FEED',
  TAG = 'TAG',
  AUTHORED = 'AUTHORED',
  FAVORITES = 'FAVORITES',
}
export type ITab =
  | { type: ITabType.ALL; label: string }
  | { type: ITabType.FEED; label: string }
  | { type: ITabType.TAG; label: string }
  | { type: ITabType.AUTHORED; label: string; username: string }
  | { type: ITabType.FAVORITES; label: string; username: string }

export interface ArticleListState {
  articles: Array<IArticle>
  loading: boolean
  error: string | null
  articlesCount: number
  selectedTab: ITab
  page: number
}

export const initialState: ArticleListState = {
  articles: [],
  loading: false,
  error: null,
  articlesCount: 0,
  selectedTab: { type: ITabType.ALL, label: 'Global Feed' },
  page: 0,
}

export function articlesReducer(
  state: ArticleListState,
  action: ArticleListAction
): ArticleListState {
  switch (action.type) {
    case ArticleListActionType.FETCH_ARTICLES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case ArticleListActionType.FETCH_ARTICLES_SUCCESS:
      return {
        ...state,
        loading: false,
        articles: action.payload.articles,
        // articlesCount: action.payload.articlesCount,
      }
    case ArticleListActionType.FETCH_ARTICLES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
        articles: [],
      }
    case ArticleListActionType.ARTICLE_FAVORITED:
    case ArticleListActionType.ARTICLE_UNFAVORITED:
      return {
        ...state,
        articles: state.articles.map((article) =>
          article.slug === action.payload.article.slug
            ? {
                ...article,
                favorited: action.payload.article.favorited,
                favoritesCount: action.payload.article.favoritesCount,
              }
            : article
        ),
      }
    case ArticleListActionType.SET_TAB:
      return {
        ...state,
        selectedTab: action.tab,
      }
    case ArticleListActionType.SET_PAGE:
      return {
        ...state,
        page: action.page,
      }
    default:
      return state
  }
}
