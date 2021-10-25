export interface IProfile {
  username: string
  bio: string
  image: string
  following: boolean
}

export interface IArticle {
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

export interface IComment {
  id: number
  createdAt: Date
  updatedAt: Date
  body: string
  author: IProfile
}

export interface IUser {
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
