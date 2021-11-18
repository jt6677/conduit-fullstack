import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { ArticlesProvider } from '~/context/ArticlesContext'
import { useAuth } from '~/context/AuthContext'
import Article from '~/screen/article'
import Editor from '~/screen/editor/Editor'
import Home from '~/screen/home'
import Header from '~/screen/navbar/Header'
import Profile from '~/screen/navbar/Profile'
import Settings from '~/screen/navbar/Settings'
import Signin from '~/screen/navbar/Signin'
import Signup from '~/screen/navbar/Signup'

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
