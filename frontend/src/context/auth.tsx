import React, { createContext, Dispatch, useContext, useReducer } from 'react'
import {
  authReducer,
  initialState,
  AuthAction,
  AuthState,
  AuthActionType,
} from '../reducers/auth'
import { useFetch } from '../context/FetchContext'
import { IUser } from '../types'

export function createCtx<ContextType>() {
  const ctx = React.createContext<ContextType | undefined>(undefined)
  function useCtx() {
    const c = React.useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const
}

type AuthContextProps = {
  state: AuthState
  dispatch: Dispatch<AuthAction>
  GetUser: () => Promise<IUser>
  Signin: (email: string, password: string) => Promise<IUser>
  Signup: (username: string, email: string, password: string) => Promise<IUser>
  Signout: () => any
}
export const [useAuth, CtxProvider] = createCtx<AuthContextProps>()
// AuthProvider wrappes AuthContext.Provider
export function AuthProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { authAxios } = useFetch()
  function GetUser(): Promise<IUser> {
    return authAxios.get<IUser>('me').then((response) => response.data)
  }
  function Signin(email: string, password: string): Promise<IUser> {
    return authAxios
      .post<IUser>('/signin', { email, password })
      .then((response) => response.data)
  }
  function Signup(
    username: string,
    email: string,
    password: string
  ): Promise<IUser> {
    return authAxios
      .post<IUser>('/signup', { username, email, password })
      .then((response) => response.data)
  }
  function Signout() {
    return authAxios.get('/signout')
  }

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const user = await GetUser()
        dispatch({ type: AuthActionType.LOAD_USER, user })
      } catch (err) {
        dispatch({ type: AuthActionType.SIGNOUT })
        console.log('cannot auto signin', err)
      }
    }
    fetchUser()
  }, [])

  return (
    <CtxProvider
      value={{ state, dispatch, GetUser, Signin, Signup, Signout }}
      {...props}
    />
  )
}
