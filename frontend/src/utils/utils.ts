export const APP_NAME = 'Go_Forward'
export const API_URL = '/api'
export const ALT_BIO = '用户什么也没有留下，系统只好补脑一些东东了'
export const ALT_IMAGE_URL =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

export function getLocalStorageValue(key: string): string | null {
  const value = localStorage.getItem(key)
  if (!value) return null
  const token: string = JSON.parse(value) as string
  return token
}

export function setLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, JSON.stringify(value))
}
