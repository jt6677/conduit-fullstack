import * as React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
// import {ReactQueryConfigProvider} from 'react-query'
import { AuthProvider } from '../context/auth'

// const queryConfig = {
//   queries: {
//     useErrorBoundary: true,
//     refetchOnWindowFocus: false,
//     retry(failureCount, error) {
//       if (error.status === 404) return false
//       else if (failureCount < 2) return true
//       else return false
//     },
//   },
// }
type AppProvidersProps = {
  children: React.ReactNode
}
function AppProviders({ children }: AppProvidersProps) {
  return (
    // <ReactQueryConfigProvider config={queryConfig}>
    <Router>
      <AuthProvider>{children}</AuthProvider>
      {/* <AuthProvider>{children}</AuthProvider> */}
    </Router>
    // </ReactQueryConfigProvider>
  )
}

export { AppProviders }
