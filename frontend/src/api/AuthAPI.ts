import { AxiosResponse } from 'axios'
import API, { TOKEN_KEY, setToken } from './APIUtils'
import { IUser } from '../types'
import { setLocalStorage } from '../utils/utils'

type User = {
  user: IUser & { token: string }
}

function handleUserResponse({ user: { token, ...user } }: User) {
  setLocalStorage(TOKEN_KEY, token)
  setToken(token)
  return user
}

export function getCurrentUser(): Promise<AxiosResponse<User>> {
  return API.get<User>('/me')
}

export function login(email: string, password: string) {
  return API.post<User>('/signin', {
    user: { email, password },
  })
}
// export function login(
//   email: string,
//   password: string
// ): Promise<{
//   email: string
//   username: string
//   bio: string
//   image: string
// }> {
//   return API.post<User>('/signin', {
//     user: { email, password },
//   }).then((user) => handleUserResponse(user.data))
// }

export function register(user: {
  username: string
  email: string
  password: string
}): Promise<{
  email: string
  username: string
  bio: string
  image: string
}> {
  return API.post<User>('/signup', { user }).then((user) =>
    handleUserResponse(user.data)
  )
}

export function updateUser(
  user: IUser & Partial<{ password: string }>
): Promise<AxiosResponse<User>> {
  return API.put<User>('/user', { user })
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  setToken(null)
}
