export const theme = {
  colors: {
    primary: '#4361ee',
    primaryHover: '#3a56d4',
    secondary: '#7209b7',
    success: '#06d6a0',
    danger: '#ef476f',
    warning: '#ffd166',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#6c757d',
    border: '#dee2e6',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    heading: '2rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Theme = typeof theme;
