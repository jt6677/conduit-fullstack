import React from 'react'
import { useHistory, Link, RouteProps, Redirect } from 'react-router-dom'
import { register } from '../../api/AuthAPI'
import useAuth from '../../context/auth'
import ListErrors from '../../common/ListErrors'
import { IErrors } from '../../types'
import { AuthActionType } from '../../reducers/auth'
export default function Register(_: RouteProps) {
  const [form, setForm] = React.useState({
    username: '',
    email: '',
    password: '',
  })
  let history = useHistory()
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<IErrors | null>(null)
  const {
    state: { user },
    dispatch,
  } = useAuth()

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    const { username, email, password } = form
    try {
      const user = await register({ username, email, password })
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
      {/* <div className="flex flex-wrap "> */}
      <div className="grid grid-cols-4 ">
        <div className="col-span-2 col-start-2 ">
          <h1 className="mb-2 text-4xl font-medium text-center">Sign up</h1>
          <p className="mb-4 text-center text-green-500">
            <Link to="/login">Have an account?</Link>
          </p>
          {errors && <ListErrors errors={errors} />}
          <form className="grid justify-items-center" onSubmit={handleSubmit}>
            <fieldset className="mb-4 ">
              <input
                name="username"
                className="block px-8 py-3 border border-gray-300 rounded"
                type="text"
                value={form.username}
                placeholder="Your Name"
                onChange={handleChange}
              />
            </fieldset>
            <fieldset className="mb-4">
              <input
                name="email"
                className="block px-8 py-3 border border-gray-300 rounded"
                type="email"
                value={form.email}
                placeholder="Email"
                onChange={handleChange}
              />
            </fieldset>
            <fieldset className="mb-4">
              <input
                name="password"
                className="block px-8 py-3 border border-gray-300 rounded"
                type="password"
                value={form.password}
                placeholder="Password"
                onChange={handleChange}
              />
            </fieldset>
            <button
              className="px-4 py-2 ml-40 text-lg font-medium text-white bg-green-500 rounded"
              disabled={loading}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
      {/* </div> */}
    </div>
  )
}
