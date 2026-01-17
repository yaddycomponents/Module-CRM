import { Table as AntTable } from 'antd'
import type { TableProps as AntTableProps } from 'antd'

export interface CrmTableProps<T> extends AntTableProps<T> {
  variant?: 'default' | 'compact' | 'striped'
}

export function CrmTable<T extends object>({
  variant = 'default',
  ...props
}: CrmTableProps<T>) {
  const getRowClassName = (_record: T, index: number) => {
    if (variant === 'striped' && index % 2 === 1) {
      return 'striped-row'
    }
    return ''
  }

  return (
    <AntTable<T>
      {...props}
      rowClassName={getRowClassName}
      size={variant === 'compact' ? 'small' : 'middle'}
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        ...props.style,
      }}
    />
  )
}

export const tableStyles = `
  .striped-row {
    background-color: #f8fafc;
  }
  .ant-table-thead > tr > th {
    background: #f8fafc !important;
    color: #475569;
    font-weight: 600;
  }
`
