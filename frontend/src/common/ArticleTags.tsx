import React from 'react'

export default function ArticleTags({ tagList }: { tagList: string[] }) {
  return (
    <ul className="float-right ">
      {tagList.map((tag) => (
        <li
          className="inline-block px-2 py-0 mr-1 text-base font-light text-center text-gray-500 border border-gray-500 rounded-3xl"
          key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  )
}
