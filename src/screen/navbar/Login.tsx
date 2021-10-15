import React from 'react'
import { useHistory, Link, RouteProps, Redirect } from 'react-router-dom'
import { login } from '../../api/AuthAPI'
import ListErrors from '../../common/ListErrors'
import useAuth from '../../context/auth'
import { IErrors } from '../../types'
import { AuthActionType } from '../../reducers/auth'

export default function Login(_: RouteProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<IErrors | null>()
  const {
    state: { user },
    dispatch,
  } = useAuth()
  let history = useHistory()

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      dispatch({ type: AuthActionType.LOAD_USER, user })
      history.push('/')
    } catch (error) {
      console.log(error)
      setLoading(false)
      // if (error.status === 422) {
      //   setErrors(error.data.errors)
      // }
    }
  }

  if (user) {
    return <Redirect to="/" />
  }

  return (
    <div className="container pl-4 pr-4 mt-6 ml-auto mr-auto">
      <div className="grid grid-cols-4 ">
        <div className="col-span-2 col-start-2 ">
          <h1 className="mb-2 text-4xl font-medium text-center">Sign in</h1>
          <p className="mb-4 text-center text-green-500">
            <Link to="/register">Need an account?</Link>
          </p>
          {errors && <ListErrors errors={errors} />}
          <form className="grid justify-items-center" onSubmit={handleSubmit}>
            <fieldset className="mb-4">
              <input
                name="email"
                className="block px-8 py-3 border border-gray-300 rounded"
                type="email"
                value={email}
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </fieldset>
            <fieldset className="mb-4">
              <input
                name="password"
                className="block px-8 py-3 border border-gray-300 rounded"
                type="password"
                value={password}
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </fieldset>
            <button
              className="px-4 py-2 ml-40 text-lg font-medium text-white bg-green-500 rounded "
              type="submit"
              disabled={loading}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
