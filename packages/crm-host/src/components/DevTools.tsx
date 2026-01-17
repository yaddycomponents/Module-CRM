import { useState, useEffect } from 'react'
import { Badge, Button, Card, ColorPicker, Divider, Drawer, Space, Tabs, Tag, Typography } from 'antd'
import { CheckCircleOutlined, LinkOutlined, ToolOutlined } from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'

const { Text, Title } = Typography

interface FederatedModule {
  name: string
  url: string
  status: 'loaded' | 'pending' | 'error'
  exposedComponents: string[]
}

export default function DevTools() {
  const [open, setOpen] = useState(false)
  const [modules, setModules] = useState<FederatedModule[]>([])
  const [themeColors, setThemeColors] = useState({
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  })

  useEffect(() => {
    async function checkModules() {
      const cashappsModule: FederatedModule = {
        name: 'cashappsRemote',
        url: 'http://localhost:5001/assets/remoteEntry.js',
        status: 'pending',
        exposedComponents: ['PaymentList', 'routes'],
      }

      try {
        await import('cashappsRemote/routes')
        cashappsModule.status = 'loaded'
      } catch {
        cashappsModule.status = 'error'
      }

      setModules([cashappsModule])
    }

    if (open) {
      checkModules()
    }
  }, [open])

  const sharedDeps = [
    { name: 'react', version: '^18.2.0', singleton: true },
    { name: 'react-dom', version: '^18.2.0', singleton: true },
    { name: 'react-router-dom', version: '^6.21.0', singleton: true },
    { name: 'antd', version: '^5.12.0', singleton: true },
  ]

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<ToolOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        }}
      />

      <Drawer
        title={
          <Space>
            <ToolOutlined />
            <span>Module Federation DevTools</span>
          </Space>
        }
        placement="right"
        width={400}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Tabs
          items={[
            {
              key: 'federation',
              label: 'Federation',
              children: (
                <div>
                  <Title level={5}>Remote Modules</Title>
                  {modules.map((module) => (
                    <Card key={module.name} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{module.name}</Text>
                          <Badge
                            status={module.status === 'loaded' ? 'success' : module.status === 'error' ? 'error' : 'processing'}
                            text={module.status}
                          />
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <LinkOutlined /> {module.url}
                        </Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Exposed:</Text>
                          <div style={{ marginTop: 4 }}>
                            {module.exposedComponents.map((comp) => (
                              <Tag key={comp} color="blue" style={{ marginBottom: 4 }}>
                                ./{comp}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </Space>
                    </Card>
                  ))}

                  <Divider />

                  <Title level={5}>Shared Dependencies</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    These libraries are loaded once and shared between host and remotes
                  </Text>
                  {sharedDeps.map((dep) => (
                    <div
                      key={dep.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <Space>
                        <Text>{dep.name}</Text>
                        <Tag>{dep.version}</Tag>
                      </Space>
                      {dep.singleton && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          singleton
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: 'theme',
              label: 'Theme Editor',
              children: (
                <div>
                  <Title level={5}>Live Theme Colors</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Edit colors here to see changes across Host and Remote components
                  </Text>

                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {Object.entries(themeColors).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ textTransform: 'capitalize' }}>{key}</Text>
                        <Space>
                          <ColorPicker
                            value={value}
                            onChange={(color: Color) => {
                              setThemeColors((prev) => ({
                                ...prev,
                                [key]: color.toHexString(),
                              }))
                            }}
                          />
                          <Text code>{value}</Text>
                        </Space>
                      </div>
                    ))}
                  </Space>

                  <Divider />

                  <Title level={5}>How Theme Sharing Works</Title>
                  <Card size="small" style={{ background: '#f8fafc' }}>
                    <pre style={{ margin: 0, fontSize: 11, overflow: 'auto' }}>
{`// growcomponents-module/src/theme.ts
export const theme = {
  token: {
    colorPrimary: '${themeColors.primary}',
    colorSuccess: '${themeColors.success}',
    colorWarning: '${themeColors.warning}',
    colorError: '${themeColors.error}',
  }
}

// Both Host and Remote import same theme:
import { theme } from 'growcomponents-module'`}
                    </pre>
                  </Card>

                  <Divider />

                  <Title level={5}>Component Source</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Dashboard</Text>
                      <Tag color="purple">Host</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Sidebar</Text>
                      <Tag color="purple">Host</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Breadcrumb</Text>
                      <Tag color="purple">Host</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>PaymentList</Text>
                      <Tag color="cyan">Remote (cashappsRemote)</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>StatCard</Text>
                      <Tag color="green">Shared (growcomponents-module)</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>CrmButton</Text>
                      <Tag color="green">Shared (growcomponents-module)</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>CrmTable</Text>
                      <Tag color="green">Shared (growcomponents-module)</Tag>
                    </div>
                  </Space>
                </div>
              ),
            },
            {
              key: 'architecture',
              label: 'Architecture',
              children: (
                <div>
                  <Title level={5}>Module Federation Architecture</Title>
                  <Card size="small" style={{ background: '#1e1b4b', color: '#fff', marginBottom: 16 }}>
                    <pre style={{ margin: 0, fontSize: 10, color: '#a5b4fc', overflow: 'auto' }}>
{`┌─────────────────────────────────┐
│         CRM Host (:3000)         │
│  ┌─────────────────────────────┐ │
│  │  ConfigProvider (theme)     │ │
│  │  ┌─────────────────────────┐│ │
│  │  │ Dashboard (Host)        ││ │
│  │  │ Customers (Host)        ││ │
│  │  │ CashApps (Remote) ←─────┼┼─┤
│  │  └─────────────────────────┘│ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
              ↑
              │ HTTP (runtime)
              ↓
┌─────────────────────────────────┐
│    CashApps Remote (:5001)       │
│  ┌─────────────────────────────┐ │
│  │ remoteEntry.js              │ │
│  │ ├─ PaymentList              │ │
│  │ └─ routes                   │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
              ↑
              │ workspace:*
              ↓
┌─────────────────────────────────┐
│       growcomponents-module             │
│  theme, CrmButton, StatCard...  │
└─────────────────────────────────┘`}
                    </pre>
                  </Card>

                  <Title level={5}>Key Concepts</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card size="small">
                      <Text strong>Runtime Loading</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Remote modules are loaded via HTTP at runtime, not bundled at build time
                      </Text>
                    </Card>
                    <Card size="small">
                      <Text strong>Singleton Sharing</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        React, ReactDOM, and Antd are loaded once and shared to avoid conflicts
                      </Text>
                    </Card>
                    <Card size="small">
                      <Text strong>Independent Deployment</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        CashApps team can deploy their remote without rebuilding Host
                      </Text>
                    </Card>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  )
}
