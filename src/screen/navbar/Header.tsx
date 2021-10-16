import React from 'react'
import {
  Route,
  Link as RouterLink,
  useRouteMatch,
  LinkProps,
  NavLink,
} from 'react-router-dom'
import useAuth from '../../context/auth'
import { IUser } from '../../types'
import { APP_NAME } from '../../utils'
// const NavLink = (props: LinkProps<any>) => (
//   // @ts-ignore
//   <RouterLink getProps={isActive} {...props} />
// )
const LoggedInView = ({ user: { username, image } }: { user: IUser }) => (
  <ul className="flex float-right space-x-4 list-none ">
    <li className="float-left">
      <NavLink to="/">Home</NavLink>
    </li>

    <li className="float-left">
      <NavLink to="/editor">
        <i className="ion-compose" />
        &nbsp;New Post
      </NavLink>
    </li>

    <li className="float-left">
      <NavLink to="/settings">
        <i className="ion-gear-a" />
        &nbsp;Settings
      </NavLink>
    </li>

    <li className="float-left">
      <NavLink to={`/${username}`}>
        {image && (
          <img
            src={image}
            className="float-left w-6 h-6 mr-1 rounded-full"
            alt={username}
          />
        )}
        {username}
      </NavLink>
    </li>
  </ul>
)

const LoggedOutView = () => (
  <ul className="flex float-right space-x-4 list-none ">
    <li className="float-left">
      <RouterLink to="/">Home</RouterLink>
    </li>

    <li className="float-left">
      <RouterLink to="/login">Sign in</RouterLink>
    </li>

    <li className="float-left">
      <RouterLink to="/register">Sign up</RouterLink>
    </li>
  </ul>
)

export default function Header(): JSX.Element {
  const {
    state: { user },
  } = useAuth()

  return (
    <nav className="relative block px-2 py-4 overflow-hidden ">
      <div className="container max-w-4xl pl-4 pr-4 mx-auto ">
        <RouterLink
          to="/"
          className="float-left text-2xl font-bold text-green-500 "
        >
          {APP_NAME}
        </RouterLink>
        {user ? <LoggedInView user={user} /> : <LoggedOutView />}
      </div>
    </nav>
  )
}
