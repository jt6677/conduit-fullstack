import { IErrors } from '../types'

export enum EditorActionType {
  ADD_TAG = 'ADD_TAG',
  REMOVE_TAG = 'REMOVE_TAG',
  SET_TAGS = 'SET_TAGS',
  SET_FORM = 'SET_FORM',
  UPDATE_FORM = 'UPDATE_FORM',
  SET_ERRORS = 'SET_ERRORS',
}
type EditorAction =
  | { type: EditorActionType.ADD_TAG; tag: string }
  | { type: EditorActionType.REMOVE_TAG; tag: string }
  | { type: EditorActionType.SET_TAGS; tagList: string[] }
  | {
      type: EditorActionType.SET_FORM
      form: IForm
    }
  | {
      type: EditorActionType.UPDATE_FORM
      field: { key: string; value: string }
    }
  | { type: EditorActionType.SET_ERRORS; errors: IErrors }

interface IForm {
  title: string
  description: string
  body: string
  tag: string
}

interface EditorState {
  tagList: string[]
  form: IForm
  errors: IErrors
  loading: boolean
}

export const initalState: EditorState = {
  tagList: [],
  form: {
    title: '',
    description: '',
    body: '',
    tag: '',
  },
  errors: {},
  loading: false,
}

export function editorReducer(
  state: EditorState,
  action: EditorAction
): EditorState {
  switch (action.type) {
    case EditorActionType.ADD_TAG:
      return {
        ...state,
        tagList: [...state.tagList, action.tag],
      }
    case EditorActionType.REMOVE_TAG:
      return {
        ...state,
        tagList: state.tagList.filter((tag) => tag !== action.tag),
      }
    case EditorActionType.SET_TAGS:
      return {
        ...state,
        tagList: action.tagList,
      }
    case EditorActionType.SET_FORM:
      return {
        ...state,
        form: action.form,
      }
    case EditorActionType.UPDATE_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          [action.field.key]: action.field.value,
        },
      }
    case EditorActionType.SET_ERRORS:
      return {
        ...state,
        errors: action.errors,
      }
    default:
      return state
  }
}
