import React from 'react'
import { useHistory, Link, RouteProps, Redirect } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'
// import { Signup } from '../../api/AuthAPI'
import { useAuth } from '../../context/auth'
import { IErrors } from '../../types'
import { AuthActionType } from '../../reducers/auth'
import { useFetch } from '../../context/FetchContext'

export default function Signup(_: RouteProps) {
  const [loading, setLoading] = React.useState(false)

  const [isSuccess, setIsSuccess] = React.useState<string | null>()
  const [isError, setIsError] = React.useState<string | null>()
  const [redirectOnLogin, setRedirectOnLogin] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const {
    state: { user },
    dispatch,
    Signup,
  } = useAuth()
  let history = useHistory()

  const handleSubmit = async ({
    username,
    email,
    password,
  }: {
    username: string
    email: string
    password: string
  }) => {
    setLoading(true)
    try {
      const user = await Signup(username, email, password)
      dispatch({ type: AuthActionType.LOAD_USER, user })
      history.push('/')
    } catch (error) {
      console.log('failed to signin', error)
      setLoading(false)
    }
  }

  if (user) {
    return <Redirect to="/" />
  }
  return (
    <div className="flex flex-col justify-start min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-2 text-3xl font-extrabold text-center text-indigo-700">
          Sign up
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Or{' '}
          <Link
            to="/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            sign in with your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{ username: '', email: '', password: '' }}
            validationSchema={Yup.object({
              username: Yup.string()
                .min(5, 'Must be 5 characters or more')
                .required('Required'),
              email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
              password: Yup.string()
                .min(5, 'Must be 5 characters or more')
                .required('Required'),
            })}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(false)
              handleSubmit(values)
            }}
          >
            {(formik) => (
              <form className="space-y-2" onSubmit={formik.handleSubmit}>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    User name
                  </label>
                  <input
                    id="username"
                    type="username"
                    autoComplete="username"
                    autoFocus={true}
                    {...formik.getFieldProps('username')}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formik.touched.username && formik.errors.username ? (
                    <div className="text-red-600">{formik.errors.username}</div>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    {...formik.getFieldProps('email')}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-600">{formik.errors.email}</div>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...formik.getFieldProps('password')}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-600">{formik.errors.password}</div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="block ml-2 text-sm text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
