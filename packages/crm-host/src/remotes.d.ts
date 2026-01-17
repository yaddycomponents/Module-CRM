declare module 'cashappsRemote/PaymentList' {
  const PaymentList: React.ComponentType
  export default PaymentList
}

declare module 'cashappsRemote/routes' {
  export interface CashAppsRoute {
    path: string
    title: string
    breadcrumb: string
    component: string
    children?: CashAppsRoute[]
  }

  export const CASHAPPS_BASE_PATH: string
  export const cashappsRoutes: CashAppsRoute[]
  export const cashappsBreadcrumbs: { path: string; title: string }[]
  export const cashappsNavItems: { key: string; label: string }[]
  export function getBreadcrumbsForPath(path: string): { path: string; title: string }[]
}
