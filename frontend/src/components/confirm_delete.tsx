import Alert from '@mui/material/Alert'
import React from 'react'
import { useHistory } from 'react-router-dom'

import { useModal } from '~/components/modal/animatedModal'

type ConfirmDeleteProps = {
  handleDelete: () => Promise<string>
}
export function ConfirmDeleteModal({ handleDelete }: ConfirmDeleteProps) {
  const [, setIsOpen] = useModal()
  const [isSuccess, setIsSuccess] = React.useState<string | null>()
  const [isError, setIsError] = React.useState<string | null>()
  const history = useHistory()
  const handleClick = async () => {
    try {
      const data = await handleDelete()
      if (data === 'Successfully Deleted Article') {
        setIsSuccess('Successfully Deleted Article')
        setIsOpen(false)
        setTimeout(() => {
          history.push('/')
        }, 700)
      }
    } catch (error: any) {
      // console.log(error)
      setIsError(error)
      setTimeout(() => {
        setIsError(null)
      }, 1200)
    }
  }
  return (
    <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
      <div className="sm:flex sm:items-start">
        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
          <svg
            className="w-6 h-6 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
            Delete Article
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this article?
            </p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
          Delete
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
      {isSuccess && (
        <Alert severity="success" className="mt-2">
          {isSuccess}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" className="mt-2">
          {isError}
        </Alert>
      )}
    </div>
  )
}
