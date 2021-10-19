import React from 'react'
import axios from 'axios'
export type AuthClientType = (
  endpoint: string,
  { data, files, customHeaders, ...customConfig }?: any
) => Promise<unknown>
const FetchContext = React.createContext<AuthClientType>(authClient)
FetchContext.displayName = 'FecthContext'
const apiURL = '/api'

const csrfAxios = axios.create({
  baseURL: apiURL,
})
function authClient(
  endpoint: string,
  { data, files, customHeaders, ...customConfig }: any = {}
) {
  const config = {
    url: `/${endpoint}`,
    method: data ? 'POST' : 'GET',
    // data: data,
    data: data ? JSON.stringify(data) : files ? files : undefined,
    headers: {
      // Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': data
        ? 'application/json'
        : files
        ? 'multipart/form-data'
        : undefined,
      ...customHeaders,
    },
    ...customConfig,
  }

  return csrfAxios(config).then(async (response) => {
    if (response.status === 401) {
      // await auth.logout()
      console.log('csrf failed')
      // window.location.assign(window.location)
      window.location.reload()
      // queryClient.clear()
      // return Promise.reject({message: 'Refresh to Get CSRF Token'})
    }
    const data = await response.data
    if (response.status >= 200 && response.status < 300) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}
function FetchProvider(props: React.PropsWithChildren<any>): JSX.Element {
  // React.useEffect(() => {
  //   const getCsrf = async () => {
  //     try {
  //       const {data} = await axios.get('/v1/csrf')
  //       csrfAxios.defaults.headers['X-CSRF-Token'] = data.csrf
  //     } catch (error) {
  //       console.log('csrf error', error)
  //       window.location.assign(window.location)
  //     }
  //   }
  //   getCsrf()
  // }, [csrfAxios])

  return <FetchContext.Provider value={authClient} {...props} />
}

function useFetch() {
  const context = React.useContext(FetchContext)
  if (context === undefined) {
    throw new Error(`useFetch must be used within a FetchProvider`)
  }
  return context
}

export { FetchProvider, useFetch }
