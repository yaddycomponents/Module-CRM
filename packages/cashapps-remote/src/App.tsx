import { ConfigProvider, Layout, Typography } from 'antd'
import { theme } from '@yaddycomponents/growcomponents-module'
import PaymentList from './components/PaymentList'

const { Header, Content } = Layout
const { Title } = Typography

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#1e1b4b', padding: '0 24px' }}>
          <Title level={4} style={{ color: 'white', margin: '16px 0' }}>
            CashApps - Standalone Mode
          </Title>
        </Header>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <PaymentList />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
