import { lazy } from 'react'
import AuthRoute from './authentication'

// ** Document title
const TemplateTitle = '%s - AVDHAAN'

// ** Default Route
const DefaultRoute = '/all-project'

// if (localStorage.getItem('userData')) {
//   const navigation = JSON.parse(localStorage.getItem('userData')).access
//   console.log('Navigation .....')
//   console.log(navigation)
// } else {
//   console.log('Not Logged in ...')
// }

// ** Merge Routes
const Routes = [
  ...AuthRoute,
  {
    path: '/all-project',
    component: lazy(() => import('../../views/AllProject'))
  },
  {
    path: '/admin',
    component: lazy(() => import('../../views/project/userAccessPanel'))
  },
  // {
  //   path: '/:category/:project/:module/:pss',
  //   component: lazy(() => import('../../views/module'))
  // },,

  {
    path: '/:category/:project/:module',
    component: lazy(() => import('../../views/project'))
  },
  {
    path: '/:category/:project',
    component: lazy(() => import('../../views/project'))
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout'
  },
  {
    path: '/no',
    component: lazy(() => import('../../views/NotAuthorized')),
    layout: 'BlankLayout'
  }
]

export { DefaultRoute, TemplateTitle, Routes }
