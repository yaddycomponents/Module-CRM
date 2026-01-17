import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'

export interface CrmButtonProps extends Omit<AntButtonProps, 'color'> {
  colorScheme?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorSchemeStyles = {
  primary: { background: '#6366f1', borderColor: '#6366f1' },
  success: { background: '#10b981', borderColor: '#10b981' },
  warning: { background: '#f59e0b', borderColor: '#f59e0b' },
  danger: { background: '#ef4444', borderColor: '#ef4444' },
}

export function CrmButton({ colorScheme = 'primary', style, ...props }: CrmButtonProps) {
  const colorStyle = props.type === 'primary' ? colorSchemeStyles[colorScheme] : {}

  return (
    <AntButton
      {...props}
      style={{
        ...colorStyle,
        ...style,
      }}
    />
  )
}
