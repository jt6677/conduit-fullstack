import API from './APIUtils'
import { IProfile } from '~/types'
import { API_BASEURL } from '~/utils/utils'
type Profile = {
  profile: IProfile
}

export function followProfile(username: string) {
  return API.post<Profile>(`/profiles/${username}/follow`)
}

export function getProfile(username: string) {
  return API.get<IProfile>(`${API_BASEURL}/profiles/${username}`)
}

export function unfollowProfile(username: string) {
  return API.delete<Profile>(`/profiles/${username}/follow`)
}
