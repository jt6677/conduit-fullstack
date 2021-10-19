import React from 'react'
import { RouteProps } from 'react-router-dom'
import Banner from './Banner'
import ArticleList from '../../ArticleList'
import TabList from '../../common/TabList'
import { ITab, ITabType } from '../../reducers/articleList'
export default function Home(_: RouteProps): JSX.Element {
  const tabsData: Array<ITab> = [
    { type: ITabType.FEED, label: 'Your Feed' },
    { type: ITabType.ALL, label: 'Global Feed' },
  ]
  return (
    <div>
      <Banner />
      <div className="container max-w-5xl pl-3 pr-3 mx-auto ">
        <div className="relative col-span-3 ">
          <div>
            <TabList data={tabsData} />
          </div>
          <ArticleList />
        </div>
      </div>
    </div>
  )
}
