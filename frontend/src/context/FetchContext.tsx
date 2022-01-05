import axios, { AxiosInstance } from 'axios'
import React, { createContext, useEffect } from 'react'

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
          publicAxios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken
          authAxios.defaults.headers.common['X-CSRF-Token'] = data.csrfToken
        }
      } catch (err) {
        throw new Error('csrf error')
      }
    }
    getCsrfToken()
  }, [authAxios, publicAxios])

  publicAxios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 403:
            console.log('csrf error')
            window.location.reload()
            break
          default:
            break
        }
      }
      return Promise.reject(error)
    }
  )
  authAxios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 403:
            console.log('csrf error')
            window.location.reload()
            // throw new Error('csrf error')
            break
          default:
            break
        }
      }
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

export { FetchContext, FetchProvider, useFetch }
