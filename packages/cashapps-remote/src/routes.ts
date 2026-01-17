export interface CashAppsRoute {
  path: string
  title: string
  breadcrumb: string
  component: string
  children?: CashAppsRoute[]
}

export const CASHAPPS_BASE_PATH = '/cashapps'

export const cashappsRoutes: CashAppsRoute[] = [
  {
    path: '',
    title: 'Cash Application',
    breadcrumb: 'Cash Application',
    component: 'PaymentList',
  },
  {
    path: '/payments',
    title: 'All Payments',
    breadcrumb: 'Payments',
    component: 'PaymentList',
  },
  {
    path: '/payment/:paymentId',
    title: 'Payment Details',
    breadcrumb: 'Payment Details',
    component: 'PaymentDetails',
  },
  {
    path: '/remittance',
    title: 'Remittance',
    breadcrumb: 'Remittance',
    component: 'Remittance',
  },
  {
    path: '/logs',
    title: 'Import Logs',
    breadcrumb: 'Logs',
    component: 'ImportLogs',
  },
]

export const cashappsBreadcrumbs = [
  { path: '/', title: 'Home' },
  { path: '/cashapps', title: 'Cash Application' },
]

export function getBreadcrumbsForPath(path: string) {
  const breadcrumbs = [...cashappsBreadcrumbs]

  const paymentDetailMatch = path.match(/\/cashapps\/payment\/(\d+)/)
  if (paymentDetailMatch) {
    breadcrumbs.push({
      path: '/cashapps',
      title: 'All Payments',
    })
    breadcrumbs.push({
      path: path,
      title: `Payment #${paymentDetailMatch[1]}`,
    })
    return breadcrumbs
  }

  const route = cashappsRoutes.find(
    (r) => `${CASHAPPS_BASE_PATH}${r.path}` === path ||
           path.startsWith(`${CASHAPPS_BASE_PATH}${r.path}/`)
  )

  if (route && route.path !== '') {
    breadcrumbs.push({
      path: `${CASHAPPS_BASE_PATH}${route.path}`,
      title: route.breadcrumb,
    })
  }

  return breadcrumbs
}

export const cashappsNavItems = [
  { key: '/cashapps', label: 'All Payments' },
  { key: '/cashapps/remittance', label: 'Remittance' },
  { key: '/cashapps/logs', label: 'Import Logs' },
]
