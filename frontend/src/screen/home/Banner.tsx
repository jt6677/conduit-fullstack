import React from 'react'

export default function Banner() {
  return (
    <div className="mt-1 bg-indigo-600">
      <div className="max-w-2xl px-4 py-16 mx-auto text-center sm:py-10 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">A place to showcase JT'programming portfolio</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-indigo-200">
          also to trying out new stuff and UI components.
        </p>
      </div>
    </div>
  )
}
