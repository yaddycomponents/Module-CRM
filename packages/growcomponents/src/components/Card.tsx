import { Card as AntCard } from 'antd'
import type { CardProps as AntCardProps } from 'antd'

export interface CrmCardProps extends Omit<AntCardProps, 'variant'> {
  cardStyle?: 'default' | 'stat' | 'elevated'
}

const cardStyleVariants = {
  default: {},
  stat: {
    borderLeft: '4px solid #6366f1',
  },
  elevated: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}

export function CrmCard({ cardStyle = 'default', style, ...props }: CrmCardProps) {
  return (
    <AntCard
      {...props}
      style={{
        ...cardStyleVariants[cardStyle],
        ...style,
      }}
    />
  )
}

export function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <CrmCard cardStyle="stat">
      <div style={{ fontSize: '14px', color: '#64748b' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: '#6366f1' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{subtitle}</div>}
    </CrmCard>
  )
}
