import React from 'react'
import Header from './navbar/Header'
import Home from './home'
import Login from './navbar/Login'
import Register from './navbar/Register'
import Settings from './navbar/Settings'
import Editor from './editor/Editor'
import Profile from './navbar/Profile'
import { Switch, Route } from 'react-router-dom'
import { getCurrentUser } from '../api/AuthAPI'
import useAuth from '../context/auth'
import { AuthActionType } from '../reducers/auth'
import Article from './article'
import { ArticlesProvider } from '../context/articles'
import axios, { AxiosResponse } from 'axios'
import { IUser } from '../types'
// src\screen\home\index.tsx
function App() {
  const {
    state: { user, isAuthenticated },
    dispatch,
  } = useAuth()

  React.useEffect(() => {
    let ignore = false

    async function fetchUser() {
      try {
        // const payload = await axios.get('http://localhost:4000/user')
        // const payload: AxiosResponse<IUser> = await axios.get(
        // 'http://localhost:4000/user'
        // )
        const payload = await getCurrentUser()
        // console.log('ayload')
        // return payload
        const { token, ...user } = payload.data.user
        if (!ignore) {
          dispatch({ type: AuthActionType.LOAD_USER, user })
        }
      } catch (error) {
        return error
      }
    }
    fetchUser()
    // if (!user && isAuthenticated) {
    // fetchUser().catch((error) => console.log(error))
    // }

    return () => {
      ignore = true
    }
  }, [])

  // if (!user && isAuthenticated) {
  //   return null
  // }
  return (
    <>
      <ArticlesProvider>
        <Header />
        <AppRoutes />
      </ArticlesProvider>
    </>
  )
}

function AppRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/settings" component={Settings} />
      <Route path="/profiles/:username" component={Profile} />
      <Route path="/editor/:slug" component={Editor} />
      <Route path="/editor" component={Editor} />
      <Route path="/article/:slug" component={Article} />
    </Switch>
  )
}
export default App
