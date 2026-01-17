import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  },
  components: {
    Layout: {
      headerBg: '#1e1b4b',
      siderBg: '#1e1b4b',
    },
    Menu: {
      darkItemBg: '#1e1b4b',
      darkItemSelectedBg: '#6366f1',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#475569',
      rowHoverBg: '#f1f5f9',
    },
    Card: {
      headerBg: '#ffffff',
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
    },
  },
}

export const colors = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#f5f5f5',
  sidebar: '#1e1b4b',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
  },
}
