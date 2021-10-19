import { Redirect } from 'react-router-dom'
import axios from 'axios'
// import jwtDecode from 'jwt-decode'

export const TOKEN_KEY = 'token'
/**
 * your feed
 * 
 conduit.productionready.io/api/articles/feed?limit=10&offset=0
 https://api.realworld.io/api/articles/feed?limit=10&offset=0
 */
/**
*  Global Feed 
 https://api.realworld.io/api/articles?limit=10&offset=0
 */
// axios.defaults.baseURL = 'https://conduit.productionready.io/api'

axios.defaults.baseURL = 'http://localhost:3000/api'
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    switch (error.response.status) {
      case 401:
        // return <Redirect to= push={true} />
        // navigate('/register')
        break
      case 404:
      case 403:
        // return <Redirect to= push={true} />
        break
      default:
        return Promise.reject(error.response)
    }
  }
)

export function setToken(token: string | null) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Token ${token}`
  } else {
    delete axios.defaults.headers.common.Authorization
  }
}

type JWTPayload = {
  id: string
  username: string
  exp: number
}

export function isTokenValid(token: string) {
  try {
    // const decodedJwt: JWTPayload = jwtDecode(token)
    const currentTime = Date.now().valueOf() / 1000
    // return decodedJwt.exp > currentTime
    return true
  } catch (error) {
    return false
  }
}

export default axios
