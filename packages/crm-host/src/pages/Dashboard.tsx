import { useEffect, useRef } from 'react'
import { Tabs, Select, Row, Col, Typography, message } from 'antd'
import { StatCard } from '@yaddycomponents/growcomponents-module'

const { Title } = Typography

const filters = {
  businessUnits: ['All', 'Unit A', 'Unit B'],
  regions: ['All', 'North', 'South', 'East', 'West'],
  subsidiary: ['All', 'Sub 1', 'Sub 2'],
}

export default function Dashboard() {
  const vanillaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadVanillaWidgets() {
      try {
        const mod = await import('vanillaWidgets/registerAll')
        const widgets = mod.default || mod
        widgets.registerAll()

        vanillaRef.current?.querySelectorAll('stats-widget').forEach((widget) => {
          widget.addEventListener('stats-click', ((e: CustomEvent) => {
            message.info(`Clicked: ${e.detail.title} - Value: ${e.detail.value}`)
          }) as EventListener)
        })
      } catch (error) {
        console.log('Vanilla widgets not available:', error)
      }
    }
    loadVanillaWidgets()
  }, [])

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

      <Title level={5} style={{ marginBottom: 16 }}>Vanilla Web Components (Framework-Agnostic)</Title>
      <div
        ref={vanillaRef}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}
      >
        <stats-widget title="Total Revenue" value="$125,430" subtitle="↑ 12% from last month" color="#10b981" icon="money" />
        <stats-widget title="Active Users" value="2,847" subtitle="↑ 8% this week" color="#6366f1" icon="users" />
        <stats-widget title="Conversion Rate" value="3.24%" subtitle="↑ 0.5% improvement" color="#f59e0b" icon="trending" />
        <stats-widget title="Page Views" value="48,291" subtitle="Last 30 days" color="#ef4444" icon="chart" />
      </div>

      <Title level={5} style={{ marginBottom: 16 }}>React Components (StatCard)</Title>

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
