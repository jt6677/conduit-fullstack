import React from 'react'
import Header from './navbar/Header'
import Home from './home'
import Signin from './navbar/Signin'
import Signup from './navbar/Signup'
import Settings from './navbar/Settings'
import Editor from './editor/Editor'
import Profile from './navbar/Profile'
import { Switch, Route } from 'react-router-dom'
// import { getCurrentUser } from '../api/AuthAPI'
import { useAuth } from '../context/auth'
import { AuthActionType } from '../reducers/auth'
import Article from './article'
import { ArticlesProvider } from '../context/articles'
import axios, { AxiosResponse } from 'axios'
import { IUser } from '../types'

function App() {
  const {
    state: { user, isAuthenticated },
    dispatch,
  } = useAuth()
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
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/settings" component={Settings} />
      <Route path="/profiles/:username" component={Profile} />
      <Route path="/editor/:slug" component={Editor} />
      <Route path="/editor" component={Editor} />
      <Route path="/article/:slug" component={Article} />
    </Switch>
  )
}
export default App