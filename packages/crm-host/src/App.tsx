import { useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider, Layout, Typography, Input, Tooltip } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Breadcrumb from './components/Breadcrumb'
import DevTools from './components/DevTools'
import AppRoutes, { menuItems } from './routes'

const { Header, Sider, Content } = Layout

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  DollarOutlined: <DollarOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  SettingOutlined: <SettingOutlined />,
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  const selectedKey = location.pathname.startsWith('/cashapps') ? '/cashapps' : location.pathname

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          width={56}
          style={{
            background: '#1e1b4b',
            overflow: 'hidden',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <div style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                borderRadius: '8px',
              }}
            />
          </div>

          <div style={{ padding: '12px 0' }}>
            {menuItems.map((item) => {
              const isSelected = selectedKey === item.key
              return (
                <Tooltip key={item.key} title={item.label} placement="right">
                  <div
                    onClick={() => navigate(item.key)}
                    style={{
                      width: '40px',
                      height: '40px',
                      margin: '4px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? '#6366f1' : 'transparent',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {iconMap[item.icon]}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </Sider>

        <Layout style={{ marginLeft: 56 }}>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              height: 'auto',
              lineHeight: 'normal',
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: 0,
              zIndex: 99,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '56px'
            }}>
              <div>
                <Typography.Text strong style={{ fontSize: '14px' }}>
                  Thomas Shelby-9
                </Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  Company Dashboard
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BellOutlined style={{ fontSize: '18px', color: '#64748b' }} />
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search"
                  style={{ width: '200px' }}
                  variant="filled"
                />
              </div>
            </div>
            <div style={{ paddingBottom: '12px' }}>
              <Breadcrumb />
            </div>
          </Header>

          <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 100px)' }}>
            <AppRoutes />
          </Content>
        </Layout>

        <DevTools />
      </Layout>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
