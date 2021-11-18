import React from 'react'
import { RouteProps, useHistory } from 'react-router-dom'

import { useAuth } from '~/context/AuthContext'
import { AuthActionType } from '~/reducers/auth'
import { IErrors } from '~/types'

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
    Signout,
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
  const history = useHistory()
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
      // }
      // try {
      //   const payload = await updateUser(form)
      //   dispatch({ type: AuthActionType.LOAD_USER, user: payload.data.user })
      // } catch (error) {
      //   console.log(error)

      // if (error.status === 422) {
      //   setErrors(error.data.errors)
      // }
    }
    setLoading(false)
  }

  const handleSignout = () => {
    dispatch({ type: AuthActionType.SIGNOUT })
    Signout()
    history.push('/')
  }
  return (
    <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
      <div className="col-span-2 col-start-2 mt-12">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-bold leading-6 text-gray-900">Your Settings</h3>
              <p className="mt-1 text-sm text-gray-600">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* <form onSubmit={handleSubmit}> */}
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label
                        htmlFor="avatar-url"
                        className="block text-sm font-medium text-gray-700">
                        Avatar URL
                      </label>
                      <div className="flex mt-1 shadow-sm ">
                        <input
                          type="text"
                          name="image"
                          id="image"
                          className="flex-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="URL of profile avatar"
                          value={form.image}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="flex mt-1 shadow-sm ">
                      <input
                        type="text"
                        name="image"
                        id="image"
                        className="flex-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="flex mt-1 shadow-sm ">
                      <input
                        type="text"
                        name="email"
                        id="email"
                        className="flex-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="passwor"
                      className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="flex mt-1 shadow-sm ">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="flex-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="New Password"
                        value={form.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium text-gray-700">
                      About
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="about"
                        name="about"
                        rows={3}
                        className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Tell us something"
                        defaultValue=""
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo
                    </label>
                    <div className="flex items-center mt-1">
                      <span className="inline-block w-12 h-12 overflow-hidden bg-gray-100 rounded-full">
                        <svg
                          className="w-full h-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2 ml-5 text-sm font-medium leading-4 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cover photo
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="w-12 h-12 mx-auto text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}>
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5">
            <div className="border-t border-gray-200" />
          </div>
        </div>
        <div className="">
          <button
            type="button"
            className="px-4 py-2 font-semibold text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            onClick={handleSignout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
