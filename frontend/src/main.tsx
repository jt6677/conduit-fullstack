import '~/index.scss'

import React from 'react'
import { render } from 'react-dom'

import { AppProviders } from '~/context'
import App from '~/screen/App'

const rootElement = document.getElementById('root')
render(
  <AppProviders>
    <App />
  </AppProviders>,

  rootElement
)
