export interface IProfile {
  user_id: string
  username: string
  bio: string
  image: string
  following: boolean
}

export interface IArticle {
  article_id: string
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  created_at: string
  updated_at: string
  favorited: boolean
  favoritesCount: number
  author: IProfile
}

// export interface IComment {
//   id: number
//   createdAt: Date
//   updatedAt: Date
//   body: string
//   author: IProfile
// }

export interface IUser {
  user_id: string
  email: string
  username: string
  bio: string
  image: string
}

export interface IErrors {
  [key: string]: string[]
}
export interface IError {
  error: string
}

export interface IComment {
  comment_id: string
  author: IUser
  body: string
  // commenter_id: string
  // post_id: string
  parent_id: string
  article_id: string
  created_at: string
}
