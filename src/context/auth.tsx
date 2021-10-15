import React, { createContext, Dispatch, useContext, useReducer } from 'react'
import {
  authReducer,
  initialState,
  AuthAction,
  AuthState,
  AuthActionType,
} from '../reducers/auth'
import { getLocalStorageValue } from '../utils'
import { TOKEN_KEY, setToken, isTokenValid } from '../api/APIUtils'
import { logout } from '../api/AuthAPI'

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
    const token: string | null = getLocalStorageValue(TOKEN_KEY)

    if (!token) return

    if (isTokenValid(token)) {
      setToken(token)
      dispatch({ type: AuthActionType.LOGIN })
    } else {
      dispatch({ type: AuthActionType.LOGOUT })
      logout()
    }
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
