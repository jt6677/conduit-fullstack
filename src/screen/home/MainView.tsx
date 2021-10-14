import React from 'react'
// import ArticleList from '../ArticleList'
import TabList from '../../common/TabList'
import { ITab, ITabType } from '../../reducers/articleList'

export default function MainView(): JSX.Element {
  const tabsData: Array<ITab> = [
    { type: ITabType.FEED, label: 'Your Feed' },
    { type: ITabType.ALL, label: 'Global Feed' },
  ]

  return (
    <div className="relative col-span-3 border-b-2 border-gray-100 ">
      <div>
        <TabList data={tabsData} />
      </div>
      {/* <ArticleList /> */}
    </div>
  )
}
