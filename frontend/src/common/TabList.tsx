import React from 'react'
import { NavLink } from 'react-router-dom'
import useArticles from '~/context/articles'
import {
  ITab,
  // ITabType,
  ArticleListActionType,
} from '~/reducers/articleList'
// const tabs = [
//   { name: 'My Tab', href: '#', current: false },
//   { name: 'Global Tab', href: '#', current: true },
// ]
type TabProps = {
  isSelected: boolean
  onClick: () => void
  children: React.ReactNode
}
type TabsListProps = {
  data: ITab[]
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}
function Tab({ isSelected, onClick, children }: TabProps) {
  return (
    <div
      className={classNames(
        isSelected ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
        'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
      )}
      onClick={onClick}
    >
      {children}

      <span
        aria-hidden="true"
        className={classNames(
          isSelected ? 'bg-indigo-500' : 'bg-transparent',
          'absolute inset-x-0 bottom-0 h-0.5'
        )}
      />
    </div>
  )
}
export default function TabList({ data }: TabsListProps): JSX.Element {
  const {
    state: { selectedTab },
    dispatch,
  } = useArticles()
  const handleClick = (tab: ITab) => {
    dispatch({ type: ArticleListActionType.SET_TAB, tab })
  }

  const tabs = data.map((tab) => (
    <Tab
      key={tab.type}
      isSelected={selectedTab.type === tab.type}
      onClick={() => handleClick(tab)}
    >
      {tab.label}
    </Tab>
  ))

  return (
    <div>
      {/* small view */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          // defaultValue={tabs.find((tab) => tab.current)!.name}
        >
          {data.map((tab) => (
            <option
              key={tab.label}
              onClick={() =>
                dispatch({ type: ArticleListActionType.SET_TAB, tab })
              }
            >
              {tab.label}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div
          className="relative z-0 flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {/* {data.map((tab) => (
            <Tab
              key={tab.type}
              isSelected={selectedTab.type === tab.type}
              onClick={() =>
                dispatch({ type: ArticleListActionType.SET_TAB, tab })
              }
            >
              {tab.label}
            </Tab>
          ))} */}
          {tabs}
        </div>
        {/* <nav
          className="relative z-0 flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {tabs.map((tab, tabIdx) => (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={classNames(
                tab.current
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.current ? 'bg-indigo-500' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5'
                )}
              />
            </NavLink>
          ))}
        </nav> */}
      </div>
    </div>
  )
}
