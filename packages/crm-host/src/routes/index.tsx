import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Spin, Tabs } from 'antd'
import Dashboard from '../pages/Dashboard'

const RemotePaymentList = lazy(() => import('cashappsRemote/PaymentList'))

const defaultNavItems = [{ key: '/cashapps', label: 'All Payments' }]

function CashAppsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [navItems, setNavItems] = useState(defaultNavItems)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNavItems() {
      try {
        const { cashappsNavItems } = await import('cashappsRemote/routes')
        if (Array.isArray(cashappsNavItems) && cashappsNavItems.length > 0) {
          setNavItems(cashappsNavItems)
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
        <Route path="/cashapps/*" element={<CashAppsPage />} />
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
