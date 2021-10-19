import { IUser } from '../types'

export enum AuthActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOAD_USER = 'LOAD_USER',
}
export type AuthAction =
  | {
      type: AuthActionType.LOGIN
    }
  | {
      type: AuthActionType.LOAD_USER
      user: any
    }
  | { type: AuthActionType.LOGOUT }

export interface AuthState {
  isAuthenticated: boolean
  user: IUser | null
}

export const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.LOGIN: {
      return { ...state, isAuthenticated: true }
    }
    case AuthActionType.LOAD_USER: {
      return { ...state, user: action.user }
    }
    case AuthActionType.LOGOUT: {
      return { isAuthenticated: false, user: null }
    }
    default:
      return state
  }
}
