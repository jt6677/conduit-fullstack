import { IUser } from '~/types'

export enum AuthActionType {
  SIGNIN = 'SIGNIN',
  SIGNOUT = 'SIGNOUT',
  LOAD_USER = 'LOAD_USER',
}
export type AuthAction =
  | {
      type: AuthActionType.SIGNIN
    }
  | {
      type: AuthActionType.LOAD_USER
      user: IUser
    }
  | { type: AuthActionType.SIGNOUT }

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
    case AuthActionType.SIGNIN: {
      return { ...state, isAuthenticated: true }
    }
    case AuthActionType.LOAD_USER: {
      return { ...state, user: action.user }
    }
    case AuthActionType.SIGNOUT: {
      return { isAuthenticated: false, user: null }
    }
    default:
      return state
  }
}
