import React from 'react'
// import { Link, LinkGetProps, LinkProps } from '@reach/router'
import { Route, Link as RouterLink, useRouteMatch } from 'react-router-dom'
// import useAuth from '../context/auth'
// import { IUser } from '../types'
import { APP_NAME } from '../utils'

// const LoggedInView = ({ user: { username, image } }: { user: IUser }) => (
//   <ul className="nav navbar-nav pull-xs-right">
//     <li className="nav-item">
//       <NavLink to="/">Home</NavLink>
//     </li>

//     <li className="nav-item">
//       <NavLink to="/editor">
//         <i className="ion-compose" />
//         &nbsp;New Post
//       </NavLink>
//     </li>

//     <li className="nav-item">
//       <NavLink to="/settings">
//         <i className="ion-gear-a" />
//         &nbsp;Settings
//       </NavLink>
//     </li>

//     <li className="nav-item">
//       <NavLink to={`/${username}`}>
//         {image && <img src={image} className="user-pic" alt={username} />}
//         {username}
//       </NavLink>
//     </li>
//   </ul>
// )

const LoggedOutView = () => (
  <ul className="flex float-right space-x-4 list-none ">
    <li className="float-left">
      <RouterLink to="/">Home</RouterLink>
    </li>

    <li className="float-left">
      <RouterLink to="/">Sign in</RouterLink>
    </li>

    <li className="float-left">
      <RouterLink to="/">Sign up</RouterLink>
    </li>
  </ul>
)

export default function Header(): JSX.Element {
  // const {
  //   state: { user },
  // } = useAuth()

  return (
    <nav className="relative block px-2 py-4 overflow-hidden ">
      <div className="container max-w-4xl pl-4 pr-4 mx-auto ">
        <RouterLink
          to="/"
          className="float-left text-2xl font-bold text-green-500 "
        >
          {APP_NAME}
        </RouterLink>
        <LoggedOutView />
        {/* <Link to="/" className="navbar-brand">
          {APP_NAME}
        </Link> */}

        {/* {user ? <LoggedInView user={user} /> : <LoggedOutView />} */}
      </div>
    </nav>
  )
}
