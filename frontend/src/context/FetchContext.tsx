import axios, { AxiosInstance } from 'axios'
import React, { createContext, useEffect } from 'react'
// import axios from 'axios'
import { useHistory } from 'react-router-dom'

type ProviderValue = { authAxios: AxiosInstance; publicAxios: AxiosInstance }
type ContextDefaultValue = undefined
type ContextValue = ProviderValue | ContextDefaultValue

const FetchContext = createContext<ContextValue>(undefined)

function FetchProvider(props: React.PropsWithChildren<any>) {
  const history = useHistory()
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
        console.log('csrf error', err)
        //   window.location.reload()
        //   return Promise.reject('shit happened')
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
        console.log('failed to get csrf token')
        //   switch (error.response.status) {
        //     // case 401:
        //     //   navigate('/register')
        //     //   break
        //     // case 404:
        //     case 403:
        //       history.push('/')
        //       break
        //     default:
        //       history.push('/')
        //       break
        //   }
        // }
        return Promise.reject(error)
      }
    }
  )
  authAxios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        // console.log('aaafailed to get csrf token')
        // console.log('not authorized,please retry')
        switch (error.response.status) {
          // case 401:
          //   //   navigate('/register')
          //   history.push('/signin')
          //   break
          // case 404:
          case 403:
            console.log('not authorized,please retry')
            history.push('/')
            break
          default:
            history.push('/')
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
