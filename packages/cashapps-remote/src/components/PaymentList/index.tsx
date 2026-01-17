import { useState } from 'react'
import { Tabs, Tag, Space, Tooltip, Dropdown, Typography } from 'antd'
import {
  DownloadOutlined,
  PlusOutlined,
  FileTextOutlined,
  EyeInvisibleOutlined,
  MoreOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { CrmButton, CrmTable, StatCard } from '@yaddycomponents/growcomponents-module'
import type { ColumnsType } from 'antd/es/table'

const { Text, Link } = Typography

interface Payment {
  id: string
  paymentNumber: string
  customer: string
  customerStatus: 'known' | 'unknown'
  paymentDate: string
  description: string
  appliedAmount: number
  unappliedAmount: number
  referenceNumber: string
  paymentMode: string
  paymentSource: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    paymentNumber: '465862',
    customer: 'Bell Inc',
    customerStatus: 'known',
    paymentDate: '10 Jul 2025',
    description: 'te3546yujh 1243',
    appliedAmount: 0,
    unappliedAmount: 940,
    referenceNumber: '34222',
    paymentMode: '-',
    paymentSource: 'Manual',
  },
  {
    id: '2',
    paymentNumber: '455004',
    customer: '',
    customerStatus: 'known',
    paymentDate: '15 Apr 2025',
    description: '231',
    appliedAmount: 0,
    unappliedAmount: 132,
    referenceNumber: '2314',
    paymentMode: 'ACH',
    paymentSource: 'Manual',
  },
  {
    id: '3',
    paymentNumber: '454485',
    customer: 'Unknown',
    customerStatus: 'unknown',
    paymentDate: '16 Apr 2025',
    description: '--',
    appliedAmount: 0,
    unappliedAmount: 65767,
    referenceNumber: '56565',
    paymentMode: '-',
    paymentSource: 'Manual',
  },
]

const formatCurrency = (value: number) => {
  return `$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const columns: ColumnsType<Payment> = [
  {
    title: 'Payment #',
    dataIndex: 'paymentNumber',
    key: 'paymentNumber',
    sorter: true,
    render: (text) => <Link>{text}</Link>,
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
    sorter: true,
    render: (text, record) => (
      <Space>
        {record.customerStatus === 'unknown' ? (
          <Text type="danger">{text || 'Unknown'}</Text>
        ) : (
          <Link>{text}</Link>
        )}
        {record.customer && <Tooltip title="Info"><InfoCircleOutlined /></Tooltip>}
      </Space>
    ),
  },
  {
    title: 'Payment Date',
    dataIndex: 'paymentDate',
    key: 'paymentDate',
    sorter: true,
  },
  {
    title: 'Payment Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Applied Amount',
    dataIndex: 'appliedAmount',
    key: 'appliedAmount',
    align: 'right',
    render: (value) => formatCurrency(value),
  },
  {
    title: 'Unapplied Amount',
    dataIndex: 'unappliedAmount',
    key: 'unappliedAmount',
    align: 'right',
    sorter: true,
    render: (value) => formatCurrency(value),
  },
  {
    title: 'Reference #',
    dataIndex: 'referenceNumber',
    key: 'referenceNumber',
  },
  {
    title: 'Payment Mode',
    dataIndex: 'paymentMode',
    key: 'paymentMode',
    sorter: true,
  },
  {
    title: 'Payment Source',
    dataIndex: 'paymentSource',
    key: 'paymentSource',
    render: (text) => <Tag>{text}</Tag>,
  },
  {
    title: '',
    key: 'actions',
    render: () => (
      <Dropdown menu={{ items: [{ key: '1', label: 'View Details' }, { key: '2', label: 'Apply Payment' }] }}>
        <MoreOutlined style={{ cursor: 'pointer' }} />
      </Dropdown>
    ),
  },
]

export default function PaymentList() {
  const [activeTab, setActiveTab] = useState('unapplied')

  const stats = {
    totalUnapplied: 66839,
    fullMatch: 0,
    partialMatch: 0,
    noMatch: 66839,
    paymentsCount: 3,
  }

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '16px' }}>All Payments</Text>
        <Space>
          <CrmButton icon={<DownloadOutlined />}>Import</CrmButton>
          <CrmButton type="primary" icon={<PlusOutlined />}>Payment</CrmButton>
          <CrmButton icon={<FileTextOutlined />}>Logs</CrmButton>
          <CrmButton icon={<EyeInvisibleOutlined />}>Hide Stats</CrmButton>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'unapplied', label: 'Unapplied' },
          { key: 'partiallyApplied', label: 'Partially Applied' },
          { key: 'applied', label: 'Applied' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="Total Unapplied"
          value={formatCurrency(stats.totalUnapplied)}
          subtitle={`# Payments ${stats.paymentsCount}`}
          color="#6366f1"
        />
        <StatCard
          title="Full Match"
          value={formatCurrency(stats.fullMatch)}
          subtitle="# Payments 0"
          color="#10b981"
        />
        <StatCard
          title="Partial Match"
          value={formatCurrency(stats.partialMatch)}
          subtitle="# Payments 0"
          color="#f59e0b"
        />
        <StatCard
          title="No Match"
          value={formatCurrency(stats.noMatch)}
          subtitle={`# Payments ${stats.paymentsCount}`}
          color="#ef4444"
        />
      </div>

      <CrmTable
        columns={columns}
        dataSource={mockPayments}
        rowKey="id"
        rowSelection={{ type: 'checkbox' }}
        pagination={{
          total: mockPayments.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]} - ${range[1]} of ${total}`,
        }}
      />
    </div>
  )
}
