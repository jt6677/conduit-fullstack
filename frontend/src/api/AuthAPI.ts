import { AxiosResponse } from 'axios'

import { useFetch } from '../context/FetchContext'
import { IUser } from '../types'
import API, { setToken, TOKEN_KEY } from './APIUtils'

export function GetUser(): Promise<IUser> {
  const { authAxios } = useFetch()
  return authAxios.get<IUser>('me').then((response) => response.data)
}

export function Signin(email: string, password: string): Promise<IUser> {
  const { authAxios } = useFetch()
  return authAxios
    .post<IUser>('/signin', {
      user: { email, password },
    })
    .then((response) => response.data)
}

export function Signup(
  username: string,
  email: string,
  password: string
): Promise<IUser> {
  const { authAxios } = useFetch()
  return authAxios
    .post<IUser>('/signup', { username, email, password })
    .then((response) => response.data)
}

export function Signout() {
  const { authAxios } = useFetch()
  console.log('signing out')
  return authAxios.get('/signout')
}
