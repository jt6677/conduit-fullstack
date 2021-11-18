import React from 'react'
import { RouteProps } from 'react-router-dom'

import TabList from '~/common/TabList'
import { ITab, ITabType } from '~/reducers/articleList'
import ArticleList from '~/screen/article/ArticleList'
import Banner from '~/screen/home/Banner'

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
