import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Spin, Tabs } from 'antd'
import Dashboard from '../pages/Dashboard'

const RemotePaymentList = lazy(() => import('cashappsRemote/PaymentList'))
const RemotePaymentDetails = lazy(() => import('cashappsRemote/PaymentDetails'))

const defaultNavItems = [{ key: '/cashapps', label: 'All Payments' }]

function CashAppsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [navItems, setNavItems] = useState(defaultNavItems)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNavItems() {
      try {
        const routesModule = await import('cashappsRemote/routes')
        const routes = routesModule.default || routesModule
        if (Array.isArray(routes.cashappsNavItems) && routes.cashappsNavItems.length > 0) {
          setNavItems(routes.cashappsNavItems)
        }
      } catch (error) {
        console.log('Could not load cashapps nav items:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNavItems()
  }, [])

  const safeNavItems = Array.isArray(navItems) ? navItems : defaultNavItems
  const activeTab = safeNavItems.find((item) =>
    location.pathname === item.key || location.pathname.startsWith(`${item.key}/`)
  )?.key || '/cashapps'

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => navigate(key)}
        items={safeNavItems.map((item) => ({
          key: item.key,
          label: item.label,
        }))}
        style={{ marginBottom: '16px' }}
      />
      <RemotePaymentList />
    </div>
  )
}

function CashAppsDetailPage() {
  return <RemotePaymentDetails />
}

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Spin size="large" tip="Loading module..." />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cashapps" element={<CashAppsListPage />} />
        <Route path="/cashapps/payment/:paymentId" element={<CashAppsDetailPage />} />
        <Route path="/customers" element={<div>Customers Page</div>} />
        <Route path="/invoices" element={<div>Invoices Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Routes>
    </Suspense>
  )
}

export const menuItems = [
  { key: '/', icon: 'DashboardOutlined', label: 'Dashboard' },
  { key: '/customers', icon: 'TeamOutlined', label: 'Customers' },
  { key: '/cashapps', icon: 'DollarOutlined', label: 'Cash Application' },
  { key: '/invoices', icon: 'FileTextOutlined', label: 'Invoices' },
  { key: '/settings', icon: 'SettingOutlined', label: 'Settings' },
]
