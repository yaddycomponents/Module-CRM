import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Space, Timeline, Divider, Typography, Row, Col } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { CrmButton } from '@yaddycomponents/growcomponents-module'

const { Title, Text } = Typography

const mockPaymentData: Record<string, {
  id: string
  paymentNumber: string
  customer: string
  customerEmail: string
  paymentDate: string
  description: string
  appliedAmount: number
  unappliedAmount: number
  totalAmount: number
  referenceNumber: string
  paymentMode: string
  paymentSource: string
  bankAccount: string
  status: 'applied' | 'partially_applied' | 'unapplied'
  applications: { invoiceId: string; amount: number; date: string }[]
  history: { action: string; date: string; user: string }[]
}> = {
  '465862': {
    id: '1',
    paymentNumber: '465862',
    customer: 'Bell Inc',
    customerEmail: 'accounts@bellinc.com',
    paymentDate: '10 Jul 2025',
    description: 'te3546yujh 1243',
    appliedAmount: 0,
    unappliedAmount: 940,
    totalAmount: 940,
    referenceNumber: '34222',
    paymentMode: 'Wire Transfer',
    paymentSource: 'Manual',
    bankAccount: 'Chase ****4521',
    status: 'unapplied',
    applications: [],
    history: [
      { action: 'Payment created', date: '10 Jul 2025 09:30 AM', user: 'John Smith' },
      { action: 'Assigned to AR team', date: '10 Jul 2025 10:15 AM', user: 'System' },
    ],
  },
  '455004': {
    id: '2',
    paymentNumber: '455004',
    customer: 'Acme Corp',
    customerEmail: 'billing@acmecorp.com',
    paymentDate: '15 Apr 2025',
    description: '231',
    appliedAmount: 0,
    unappliedAmount: 132,
    totalAmount: 132,
    referenceNumber: '2314',
    paymentMode: 'ACH',
    paymentSource: 'Manual',
    bankAccount: 'BOA ****7832',
    status: 'unapplied',
    applications: [],
    history: [
      { action: 'Payment created', date: '15 Apr 2025 02:00 PM', user: 'Jane Doe' },
    ],
  },
  '454485': {
    id: '3',
    paymentNumber: '454485',
    customer: 'Unknown',
    customerEmail: '-',
    paymentDate: '16 Apr 2025',
    description: '--',
    appliedAmount: 0,
    unappliedAmount: 65767,
    totalAmount: 65767,
    referenceNumber: '56565',
    paymentMode: 'Check',
    paymentSource: 'Manual',
    bankAccount: 'Wells Fargo ****1234',
    status: 'unapplied',
    applications: [],
    history: [
      { action: 'Payment created', date: '16 Apr 2025 11:00 AM', user: 'Mike Johnson' },
      { action: 'Customer identification pending', date: '16 Apr 2025 11:30 AM', user: 'System' },
    ],
  },
}

const formatCurrency = (value: number) => {
  return `$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'success'
    case 'partially_applied':
      return 'warning'
    case 'unapplied':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'applied':
      return 'Fully Applied'
    case 'partially_applied':
      return 'Partially Applied'
    case 'unapplied':
      return 'Unapplied'
    default:
      return status
  }
}

export default function PaymentDetails() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()

  const payment = paymentId ? mockPaymentData[paymentId] : null

  if (!payment) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Title level={4}>Payment Not Found</Title>
          <Text type="secondary">The payment #{paymentId} does not exist.</Text>
          <br /><br />
          <CrmButton type="primary" onClick={() => navigate('/cashapps')}>
            Back to Payments
          </CrmButton>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <CrmButton icon={<ArrowLeftOutlined />} onClick={() => navigate('/cashapps')}>
            Back
          </CrmButton>
          <Title level={4} style={{ margin: 0 }}>Payment #{payment.paymentNumber}</Title>
          <Tag color={getStatusColor(payment.status)}>{getStatusLabel(payment.status)}</Tag>
        </Space>
        <Space>
          <CrmButton icon={<FileTextOutlined />}>Export</CrmButton>
          <CrmButton type="primary" icon={<DollarOutlined />}>Apply Payment</CrmButton>
        </Space>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Payment Information">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Payment Number">{payment.paymentNumber}</Descriptions.Item>
              <Descriptions.Item label="Reference Number">{payment.referenceNumber}</Descriptions.Item>
              <Descriptions.Item label="Payment Date">{payment.paymentDate}</Descriptions.Item>
              <Descriptions.Item label="Payment Mode">{payment.paymentMode}</Descriptions.Item>
              <Descriptions.Item label="Payment Source">
                <Tag>{payment.paymentSource}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bank Account">
                <Space>
                  <BankOutlined />
                  {payment.bankAccount}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{payment.description}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Customer Information" style={{ marginTop: '16px' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Customer Name">
                <Space>
                  <UserOutlined />
                  {payment.customer === 'Unknown' ? (
                    <Text type="danger">{payment.customer}</Text>
                  ) : (
                    <Text style={{ color: '#1677ff', cursor: 'pointer' }}>{payment.customer}</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{payment.customerEmail}</Descriptions.Item>
            </Descriptions>
          </Card>

          {payment.applications.length > 0 && (
            <Card title="Applied Invoices" style={{ marginTop: '16px' }}>
              {payment.applications.map((app) => (
                <div key={app.invoiceId} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>{app.invoiceId}</Text>
                    <Text strong>{formatCurrency(app.amount)}</Text>
                    <Text type="secondary">{app.date}</Text>
                  </Space>
                </div>
              ))}
            </Card>
          )}
        </Col>

        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Text type="secondary">Total Amount</Text>
              <Title level={2} style={{ margin: '8px 0', color: '#6366f1' }}>
                {formatCurrency(payment.totalAmount)}
              </Title>
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text>Applied Amount</Text>
              <Text strong style={{ color: '#10b981' }}>{formatCurrency(payment.appliedAmount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Unapplied Amount</Text>
              <Text strong style={{ color: '#ef4444' }}>{formatCurrency(payment.unappliedAmount)}</Text>
            </div>
          </Card>

          <Card title="Activity History" style={{ marginTop: '16px' }}>
            <Timeline
              items={payment.history.map((item) => ({
                dot: <ClockCircleOutlined />,
                children: (
                  <div>
                    <Text strong>{item.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.date} by {item.user}
                    </Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
