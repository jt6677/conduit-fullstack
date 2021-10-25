import React from 'react'
import '~/index.css'
import { render } from 'react-dom'
import App from '~/screen/App'
import { AppProviders } from '~/context'

const rootElement = document.getElementById('root')
render(
  <AppProviders>
    <App />
  </AppProviders>,

  rootElement
)
