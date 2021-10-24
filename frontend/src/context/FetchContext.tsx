import React, { createContext, useEffect } from 'react'
import axios, { AxiosInstance } from 'axios'

type ProviderValue = { authAxios: AxiosInstance; publicAxios: AxiosInstance }
type ContextDefaultValue = undefined
type ContextValue = ProviderValue | ContextDefaultValue

const FetchContext = createContext<ContextValue>(undefined)

function FetchProvider(props: React.PropsWithChildren<any>) {
  const publicAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })
  const authAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const { data } = await publicAxios.get<{ csrfToken: string }>(
          import.meta.env.VITE_API_URL_CSRF
        )
        if (data) {
          // publicAxios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken
          // authAxios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken
        }
      } catch (err) {
        console.log('asd', err)
        //   window.location.reload()
        //   return Promise.reject('shit happened')
      }
    }
    getCsrfToken()
  }, [authAxios, publicAxios])

  authAxios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // const code = error && error.response ? error.response.status : 0
      // if (code === 401 || code === 403) {
      //   console.log('error code', code)
      // }
      return Promise.reject(error)
    }
  )
  return (
    <FetchContext.Provider
      value={{
        authAxios,
        publicAxios,
      }}
      {...props}
    />
  )
}
function useFetch(): { authAxios: AxiosInstance; publicAxios: AxiosInstance } {
  const context = React.useContext(FetchContext)
  if (context === undefined) {
    throw new Error(`useFetch must be used within a FetchProvider`)
  }
  return context
}
export { FetchContext, useFetch, FetchProvider }
