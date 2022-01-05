import React, { Dispatch, useReducer } from 'react'

import { useFetch } from '~/context/FetchContext'
import {
  AuthAction,
  AuthActionType,
  authReducer,
  AuthState,
  initialState,
} from '~/reducers/auth'
import { IUser } from '~/types'
import { createCtx } from '~/utils/utils'

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

    // .catch((error) => error.response)
  }
  function Signup(username: string, email: string, password: string): Promise<IUser> {
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
        // console.log('object')
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
