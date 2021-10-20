import React from 'react'
import {
  Link,
  RouteComponentProps,
  RouteProps,
  useParams,
} from 'react-router-dom'
import { IProfile } from '../../types'
import useAuth from '../../context/auth'
import { ALT_IMAGE_URL, ALT_BIO } from '../../utils/utils'
import {
  unfollowProfile,
  followProfile,
  getProfile,
} from '../../api/ProfileAPI'
// interface ProfileComponentProps extends RouteComponentProps {
//   username: string
// }
// export default function Profile({
//   username = '',
// }: ProfileComponentProps): JSX.Element {
export default function Profile(_: RouteProps): JSX.Element {
  const [profile, setProfile] = React.useState<IProfile | null>(null)
  const [loading, setLoading] = React.useState(false)
  let { username } = useParams<{ username: string }>()
  const {
    state: { user },
  } = useAuth()

  React.useEffect(() => {
    let ignore = false

    async function fetchProfile() {
      try {
        const payload = await getProfile(username)
        // console.log(payload)
        if (!ignore) {
          console.log(payload.data.image)
          setProfile(payload.data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchProfile()
    return () => {
      ignore = true
    }
  }, [username])

  //  const handleClick = async () => {
  //    if (!profile) return
  //    let payload
  //    setLoading(true)
  //    try {
  //      if (profile.following) {
  //        payload = await unfollowProfile(profile.username)
  //      } else {
  //        payload = await followProfile(profile.username)
  //      }
  //      setProfile(payload.data.profile)
  //    } catch (error) {
  //      console.log(error)
  //    }
  //    setLoading(false)
  //  }

  // const isUser = profile && user && profile.username === user.username
  return (
    <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
      <div className="col-span-2 col-start-2 mt-12">
        <div className="px-4 py-5 overflow-hidden bg-white sm:rounded-lg sm:shadow ">
          {profile ? (
            <>
              <div className="pb-2 bg-white border-b border-gray-200 sm:px-6">
                <div className="flex flex-wrap items-center justify-between -mt-4 -ml-4 sm:flex-nowrap">
                  <div className="mt-4 ml-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="w-12 h-12 rounded-full"
                          src={profile.image || ALT_IMAGE_URL}
                          alt={profile.username}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          {username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <Link
                            to={`/profiles/${profile.username}`}
                          >{`@${profile.username}`}</Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-2 mt-2 opacity-50 sm:px-4 sm:pt-0">
                <p>{profile.bio || ALT_BIO}</p>
              </div>
            </>
          ) : (
            <div>No profile found</div>
          )}
        </div>
      </div>
    </div>
  )
}
