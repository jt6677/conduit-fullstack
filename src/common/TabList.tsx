import React from 'react'
import useArticles from '../context/articles'
import {
  ITab,
  // ITabType,
  ArticleListActionType,
} from '../reducers/articleList'

type TabProps = {
  isSelected: boolean
  onClick: () => void
  children: React.ReactNode
}
type TabsListProps = {
  data: ITab[]
}

function Tab({ isSelected, onClick, children }: TabProps) {
  const classNames = ['nav-link']
  if (isSelected) {
    classNames.push('active')
  }
  return (
    <li className="nav-item">
      <button className={classNames.join(' ')} type="button" onClick={onClick}>
        {children}
      </button>
    </li>
  )
}
export default function TabList({ data }: TabsListProps): JSX.Element {
  const {
    state: { selectedTab },
    dispatch,
  } = useArticles()

  const tabs = data.map((tab) => (
    <Tab
      key={tab.type}
      isSelected={selectedTab.type === tab.type}
      onClick={() => dispatch({ type: ArticleListActionType.SET_TAB, tab })}
    >
      {tab.label}
    </Tab>
  ))

  if (selectedTab.type === 'TAG') {
    tabs.push(
      <Tab key={selectedTab.type} isSelected onClick={() => {}}>
        #{selectedTab.label}
      </Tab>
    )
  }

  return <ul className="nav nav-pills outline-active">{tabs}</ul>
}
