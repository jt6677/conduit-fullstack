import axios, { AxiosError } from 'axios'
import React from 'react'

export const APP_NAME = 'Go_Forward'

// export const API_BASEURL = 'https://homebh.ga'
export const API_BASEURL = 'http://localhost:3000/api'
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

// error type assertion middleware
interface IErrorBase<T> {
  error: Error | AxiosError<T>
  type: 'axios-error' | 'stock-error'
}

interface IAxiosError<T> extends IErrorBase<T> {
  error: AxiosError<T>
  type: 'axios-error'
}
interface IStockError<T> extends IErrorBase<T> {
  error: Error
  type: 'stock-error'
}

export function axiosErrorHandler<T>(
  callback: (err: IAxiosError<T> | IStockError<T>) => void
) {
  return (error: Error | AxiosError<T>) => {
    if (axios.isAxiosError(error)) {
      callback({
        error,
        type: 'axios-error',
      })
    } else {
      callback({
        error,
        type: 'stock-error',
      })
    }
  }
}

export function createCtx<ContextType>() {
  const ctx = React.createContext<ContextType | undefined>(undefined)
  function useCtx() {
    const c = React.useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const
}
