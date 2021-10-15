import React from 'react'
import {
  // BrowserRouter as Router,
  // Route,
  // Link,

  RouteProps,
} from 'react-router-dom'
import Banner from './Banner'
import MainView from './MainView'
import Tags from './Tags'
import { ArticlesProvider } from '../../context/articles'

export default function Home(_: RouteProps): JSX.Element {
  return (
    <div>
      <Banner />
      <div className="container max-w-4xl pl-4 pr-4 mx-auto ">
        <div className="grid grid-cols-4 ">
          <ArticlesProvider>
            <MainView />
            <Tags />
          </ArticlesProvider>
        </div>
      </div>
    </div>
  )
}
