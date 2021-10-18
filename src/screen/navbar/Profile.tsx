import React from 'react'
import {
  Link,
  RouteComponentProps,
  RouteProps,
  useParams,
} from 'react-router-dom'
import { IProfile } from '../../types'
import useAuth from '../../context/auth'
import { ALT_IMAGE_URL } from '../../utils'
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
          setProfile(payload.data.profile)
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

  const isUser = profile && user && profile.username === user.username
  if (profile) {
    return (
      <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
        <div className="col-span-2 col-start-2 mt-12">
          <div className="overflow-hidden bg-white sm:rounded-lg sm:shadow">
            <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
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
                          to={`/profile/${profile.username}`}
                        >{`@${profile.username}`}</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-5 opacity-25 sm:p-6 sm:pt-0">
              <p>{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="grid h-auto grid-cols-4 pb-32 bg-gray-100 ">
        <div className="col-span-2 col-start-2 mt-12">
          <div className="overflow-hidden bg-white sm:rounded-lg sm:shadow">
            <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
              <div className="flex flex-wrap items-center justify-between -mt-4 -ml-4 sm:flex-nowrap">
                <div className="mt-4 ml-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="w-12 h-12 rounded-full"
                        src={ALT_IMAGE_URL}
                        alt={'default'}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        No User Name Provided
                      </h3>
                      <p className="text-sm text-gray-500">
                        <span>No profile loaded</span>
                        {/* <Link to="#">@tom_cook</Link> */}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
