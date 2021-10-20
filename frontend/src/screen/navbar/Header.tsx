import React, { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { PlusIcon } from '@heroicons/react/solid'
import {
  // Route,
  // Link as RouterLink,
  useRouteMatch,
  LinkProps,
  NavLink,
} from 'react-router-dom'
import useAuth from '../../context/auth'
import { IUser } from '../../types'
import { APP_NAME } from '../../utils/utils'
import { useHistory } from 'react-router-dom'
import { AuthActionType } from '../../reducers/auth'
import { useFetch } from '../../context/FetchContext'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}
type LoggedInViewProps = {
  user: IUser
  handleSignout: () => void
}
const LoggedInView = ({
  user: { username, image },
  handleSignout,
}: LoggedInViewProps) => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <NavLink
          type="button"
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          to="/editor"
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
          <span>New Post</span>
        </NavLink>
      </div>
      <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center ">
        {/* Profile dropdown */}
        <Menu as="div" className="relative ml-3">
          <div className="flex ">
            <Menu.Button className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ">
              {/* <Menu.Button className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> */}
              <span className="sr-only">Open user menu</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://i.ibb.co/JvGgxrG/logo.jpg"
                alt=""
              />
              <div className="flex items-center"> {username}</div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <NavLink
                    to={`/profiles/${username}`}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    Your Profile
                  </NavLink>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <NavLink
                    to="/settings"
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    Settings
                  </NavLink>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                    )}
                    onClick={handleSignout}
                  >
                    Sign out
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}
const LoggedInMenuView = ({
  user: { username, image },
  handleSignout,
}: LoggedInViewProps) => {
  return (
    <div className="pt-4 pb-3 border-t border-gray-200">
      <div className="flex items-center px-4 sm:px-6">
        <div className="flex-shrink-0">
          <img
            className="w-10 h-10 rounded-full"
            src="https://i.ibb.co/JvGgxrG/logo.jpg"
            alt=""
          />
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-800">{username}</div>
          <div className="text-sm font-medium text-gray-500">
            {`${username}@email.com`}
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <NavLink
          to="/profile"
          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 sm:px-6"
        >
          Your Profile
        </NavLink>
        <NavLink
          to="/settings"
          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 sm:px-6"
        >
          Settings
        </NavLink>
        <a
          // to="/signout"
          className="block px-4 py-2 text-base font-medium text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 sm:px-6"
          onClick={handleSignout}
        >
          Sign out
        </a>
      </div>
    </div>
  )
}
export default function Header() {
  const authClient = useFetch()
  const {
    state: { user },
    dispatch,
  } = useAuth()
  let history = useHistory()
  const handleSignout = (): void => {
    const logout = async () => {
      try {
        await authClient(`signout`)
      } catch (err) {
        // window.location.reload()
        console.log(err)
      }
    }
    dispatch({ type: AuthActionType.LOGOUT })
    logout()
    history.push('/')
  }
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex items-center mr-2 -ml-2 md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block w-6 h-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <img
                    className="block w-auto h-16 lg:hidden"
                    src="https://i.ibb.co/JvGgxrG/logo.jpg"
                    // src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                    alt="lfg"
                  />
                  <img
                    className="hidden w-auto h-16 transition duration-500 transform hover:scale-90 hover:opacity-80 lg:block"
                    // src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"
                    src="https://i.ibb.co/JvGgxrG/logo.jpg"
                    alt="lfg"
                  />
                  <div className="flex lg:ml-0">
                    <NavLink to="/">
                      <span className="font-bold text-indigo-600">
                        {APP_NAME}
                      </span>
                    </NavLink>
                  </div>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <NavLink
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-indigo-500"
                  >
                    Home
                  </NavLink>
                  {!user ? (
                    <>
                      <NavLink
                        to="/login"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
                      >
                        Sign In
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
                      >
                        Sign Up
                      </NavLink>
                    </>
                  ) : null}
                </div>
              </div>
              {user ? (
                <LoggedInView user={user} handleSignout={handleSignout} />
              ) : null}
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
              <NavLink
                to="/"
                className="block py-2 pl-3 pr-4 text-base font-medium text-indigo-700 border-l-4 border-indigo-500 bg-indigo-50 sm:pl-5 sm:pr-6"
              >
                Home
              </NavLink>
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className="block py-2 pl-3 pr-4 text-base font-medium text-indigo-700 border-l-4 border-indigo-500 bg-indigo-50 sm:pl-5 sm:pr-6"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="block py-2 pl-3 pr-4 text-base font-medium text-indigo-700 border-l-4 border-indigo-500 bg-indigo-50 sm:pl-5 sm:pr-6"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : null}
            </div>
            {user ? (
              <LoggedInMenuView user={user} handleSignout={handleSignout} />
            ) : null}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
