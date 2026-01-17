import { Tabs, Select, Row, Col } from 'antd'
import { StatCard } from '@yaddycomponents/growcomponents-module'

const filters = {
  businessUnits: ['All', 'Unit A', 'Unit B'],
  regions: ['All', 'North', 'South', 'East', 'West'],
  subsidiary: ['All', 'Sub 1', 'Sub 2'],
}

export default function Dashboard() {
  return (
    <div>
      <Tabs
        defaultActiveKey="snapshot"
        items={[
          { key: 'snapshot', label: 'Snapshot' },
          { key: 'analysis', label: 'Analysis' },
          { key: 'performance', label: "Collector's Performance" },
        ]}
      />

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>My Company</span>
        <Select defaultValue="All" style={{ width: 120 }} options={filters.businessUnits.map(v => ({ value: v, label: `Business Units: ${v}` }))} />
        <Select defaultValue="All" style={{ width: 120 }} options={filters.regions.map(v => ({ value: v, label: `Regions: ${v}` }))} />
        <Select defaultValue="All" style={{ width: 120 }} options={filters.subsidiary.map(v => ({ value: v, label: `Subsidiary: ${v}` }))} />
      </div>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <StatCard
            title="Total Balance"
            value="$ 3,19,20,444"
            subtitle="898 invoices • 26,942 customers"
            color="#6366f1"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Receivables Outstanding"
            value="$ 5,01,91,74,531"
            subtitle="3,543 invoices"
            color="#6366f1"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Total Collections"
            value="$ 0"
            subtitle="0 invoices • 0 customers"
            color="#10b981"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Current Due"
            value="$ 0"
            subtitle="0 invoices"
            color="#f59e0b"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Total Outstanding"
            value="$ 5,01,91,74,531"
            subtitle="3,543 invoices"
            color="#6366f1"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Current DSO"
            value="45 days"
            color="#3b82f6"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Over Due"
            value="$ 3,19,20,444"
            subtitle="26,942 invoices"
            color="#ef4444"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Unapplied Payments"
            value="$ 61,35,965"
            subtitle="291 payments"
            color="#10b981"
          />
        </Col>
        <Col span={8}>
          <StatCard
            title="Unapplied Credits"
            value="$ 2,03,436"
            subtitle="142 credits"
            color="#10b981"
          />
        </Col>
      </Row>
    </div>
  )
}
