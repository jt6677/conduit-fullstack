import React from 'react'
import Header from '../screen/navbar/Header'
import Home from '../screen/home'
import Login from '../screen/navbar/Login'
import Register from '../screen/navbar/Register'
import { Switch, Route } from 'react-router-dom'
// src\screen\home\index.tsx
function App() {
  return (
    <>
      <Header />
      {/* <Home /> */}
      <AppRoutes />
    </>
  )
}

function AppRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  )
}
export default App
