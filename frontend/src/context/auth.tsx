import React, { createContext, Dispatch, useContext, useReducer } from 'react'
import {
  authReducer,
  initialState,
  AuthAction,
  AuthState,
  AuthActionType,
} from '../reducers/auth'
import { getLocalStorageValue } from '../utils/utils'
import { TOKEN_KEY, setToken, isTokenValid } from '../api/APIUtils'
import { logout } from '../api/AuthAPI'
import { GetUser } from '../utils/api-client'

type AuthContextProps = {
  state: AuthState
  dispatch: Dispatch<AuthAction>
}

const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  dispatch: () => initialState,
})

// AuthProvider wrappes AuthContext.Provider
export function AuthProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState)
  React.useEffect(() => {
    async function fetchUser() {
      try {
        const payload = await GetUser()
        console.log(payload)
        dispatch({ type: AuthActionType.LOAD_USER, user: payload.data })
      } catch (err) {
        dispatch({ type: AuthActionType.LOGOUT })
        console.log(err)
      }
    }
    fetchUser()
    // const token: string | null = getLocalStorageValue(TOKEN_KEY)

    // if (!token) return

    // if (isTokenValid(token)) {
    //   setToken(token)

    // } else {
    //   dispatch({ type: AuthActionType.LOGOUT })
    //   logout()
    // }
  }, [])

  return <AuthContext.Provider value={{ state, dispatch }} {...props} />
}

// hooks
export default function useAuth(): AuthContextProps {
  // return React.useContext(AuthContext)

  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(`useAuth must be used within an AuthProvider`)
  }
  return context
}
