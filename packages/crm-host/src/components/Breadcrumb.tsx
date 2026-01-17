import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Breadcrumb as AntBreadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

interface BreadcrumbItem {
  path: string
  title: string
}

const staticBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [{ path: '/', title: 'Dashboard' }],
  '/customers': [
    { path: '/', title: 'Home' },
    { path: '/customers', title: 'Customers' },
  ],
  '/invoices': [
    { path: '/', title: 'Home' },
    { path: '/invoices', title: 'Invoices' },
  ],
  '/settings': [
    { path: '/', title: 'Home' },
    { path: '/settings', title: 'Settings' },
  ],
}

export default function Breadcrumb() {
  const location = useLocation()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    async function loadBreadcrumbs() {
      if (location.pathname.startsWith('/cashapps')) {
        try {
          const routesModule = await import('cashappsRemote/routes')
          const routes = routesModule.default || routesModule
          const result = routes.getBreadcrumbsForPath(location.pathname)
          if (result && result.length > 0) {
            setBreadcrumbs(result)
          } else {
            setBreadcrumbs([
              { path: '/', title: 'Home' },
              { path: '/cashapps', title: 'Cash Application' },
            ])
          }
        } catch (error) {
          console.error('Failed to load breadcrumbs from remote:', error)
          setBreadcrumbs([
            { path: '/', title: 'Home' },
            { path: '/cashapps', title: 'Cash Application' },
          ])
        }
      } else {
        setBreadcrumbs(
          staticBreadcrumbs[location.pathname] || [{ path: '/', title: 'Home' }]
        )
      }
    }
    loadBreadcrumbs()
  }, [location.pathname])

  const items = breadcrumbs.map((item, index) => ({
    key: item.path,
    title:
      index === 0 ? (
        <Link to={item.path}>
          <HomeOutlined /> {item.title}
        </Link>
      ) : index === breadcrumbs.length - 1 ? (
        item.title
      ) : (
        <Link to={item.path}>{item.title}</Link>
      ),
  }))

  return <AntBreadcrumb items={items} />
}
