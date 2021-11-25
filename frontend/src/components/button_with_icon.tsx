import { ExclamationCircleIcon } from '@heroicons/react/solid'
import React from 'react'

// function classNames(...classes: any) {
//   return classes.filter(Boolean).join(' ')
// }
type ButtonWithIconProps = {
  children: React.ReactNode
  buttonName: string
  onClick?: () => any
  disabled?: boolean
  dangerButton?: boolean
}
export default function ButtonWithIcon({
  children,
  buttonName,
  onClick,
  disabled = false,
  dangerButton = false,
}: ButtonWithIconProps): JSX.Element {
  let classNames = ''
  if (disabled) {
    classNames =
      'inline-flex items-center flex-grow-0 px-4 py-2 text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2  '
  } else if (dangerButton) {
    classNames =
      'inline-flex items-center flex-grow-0 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md shadow-sm hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2  '
  } else {
    classNames =
      'inline-flex items-center flex-grow-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 '
  }
  return (
    <div className="flex flex-col items-center">
      <button
        type={onClick ? 'button' : 'submit'}
        onClick={onClick}
        disabled={disabled}
        className={classNames}>
        <div className="w-5 h-5">{children}</div>
        <p className="ml-1">{buttonName}</p>
      </button>
      {disabled && (
        <div className="flex items-center text-gray-400 ">
          <ExclamationCircleIcon className="h-3" />
          <p className="text-sm text-center ">Please fix the issue</p>
        </div>
      )}
    </div>
  )
}
