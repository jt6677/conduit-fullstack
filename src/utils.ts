export const APP_NAME = 'Go_Forward'
export const ALT_IMAGE_URL =
  'https://static.productionready.io/images/smiley-cyrus.jpg'

export function getLocalStorageValue(key: string): string | null {
  const value = localStorage.getItem(key)
  if (!value) return null
  const token: string = JSON.parse(value) as string
  return token
}

export function setLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, JSON.stringify(value))
}
