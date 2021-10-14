import React from 'react'
import './index.css'
import { render } from 'react-dom'
import App from './components/App'
import { AppProviders } from './context'
// const App = () => {
//   return <div className="bg-gray-300">hi hui</div>
// }

const rootElement = document.getElementById('root')
render(
  <AppProviders>
    <App />
  </AppProviders>,

  rootElement
)
