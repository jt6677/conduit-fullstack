import React from 'react'
import { useHistory, RouteProps } from 'react-router-dom'
import ListErrors from '../../common/ListErrors'
import useAuth from '../../context/auth'
import { updateUser, logout } from '../../api/AuthAPI'
import { IErrors } from '../../types'
import { AuthActionType } from '../../reducers/auth'

type Form = {
  username: string
  email: string
  image: string
  bio: string
  password?: string
}

export default function Settings(_: RouteProps) {
  const {
    state: { user },
    dispatch,
  } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<IErrors | null>(null)
  const [form, setForm] = React.useState<Form>({
    username: '',
    email: '',
    image: '',
    bio: '',
    password: '',
  })
  let history = useHistory()
  React.useEffect(() => {
    if (user) {
      const { username, email, image, bio } = user
      console.log(username, email, image, bio)
      setForm({
        username,
        email,
        image: image || '',
        bio: bio || '',
        password: '',
      })
    }
  }, [user])

  const handleChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    if (!form.password) {
      delete form.password
    }
    try {
      const payload = await updateUser(form)
      dispatch({ type: AuthActionType.LOAD_USER, user: payload.data.user })
    } catch (error) {
      console.log(error)

      // if (error.status === 422) {
      //   setErrors(error.data.errors)
      // }
    }
    setLoading(false)
  }

  const handleLogout = () => {
    dispatch({ type: AuthActionType.LOGOUT })
    logout()
    history.push('/')
  }

  return (
    <>
      <div className="container pl-4 pr-4 mt-6 ml-auto mr-auto">
        <div className="grid grid-cols-4 ">
          <div className="col-span-2 col-start-2 ">
            <h1 className="mb-2 text-4xl font-medium text-center">
              Your Settings
            </h1>
            {errors && <ListErrors errors={errors} />}

            <form className="grid justify-items-center" onSubmit={handleSubmit}>
              <fieldset>
                <input
                  name="image"
                  className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                  type="text"
                  placeholder="URL of profile picture"
                  value={form.image}
                  onChange={handleChange}
                />

                <input
                  name="username"
                  className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                />

                <textarea
                  name="bio"
                  className="block w-full h-32 pl-2 mb-2 border border-gray-300 rounded"
                  rows={8}
                  placeholder="Short bio about you"
                  value={form.bio}
                  onChange={handleChange}
                />

                <input
                  name="email"
                  className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  name="password"
                  className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                  type="password"
                  placeholder="New Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  className="px-4 py-2 mb-4 ml-40 text-lg font-medium text-white bg-green-500 rounded "
                  type="submit"
                  disabled={loading}
                >
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button
              className="px-4 py-2 mt-4 ml-24 text-lg font-medium text-red-700 border border-red-700 rounded "
              onClick={handleLogout}
            >
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
