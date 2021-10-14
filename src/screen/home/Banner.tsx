import React from 'react'
import { APP_NAME } from '../../utils'

export default function Banner() {
  return (
    <div className="p-8 mb-4 text-center text-white bg-green-500 shadow">
      <div className="container pl-4 pr-4 ml-auto mr-auto ">
        <h1 className="pb-2 text-6xl font-bold">{APP_NAME}</h1>
        <p className="mt-0 text-2xl font-light">
          A place to share your knowledge.
        </p>
      </div>
    </div>
  )
}
