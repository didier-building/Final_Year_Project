// theme.js
// Centralized theme for Agrichain frontend

export const colors = {
  primary: '#219150',
  primaryDark: '#197144',
  accent: '#1976D2',
  background: '#F3FAF7',
  card: '#fff',
  cardAlt: '#E3F2FD',
  warning: '#FF9800',
  warningBg: '#FFF7E6',
  error: '#D32F2F',
  errorBg: '#FFEBEE',
  border: '#B2DFDB',
  inputBg: '#F7FDFB',
  text: '#222',
  textSecondary: '#4F8A65',
  shadow: '#219150',
  shadowAccent: '#1976D2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
};

export const font = {
  size: {
    xs: 12,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 28,
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
    extrabold: 'bold',
  },
};

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  warning: {
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  accent: {
    shadowColor: colors.shadowAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
};
