/**
 * themes.js — Paletas de cores para os temas claro e escuro.
 *
 * Cada tela importa `getTheme(theme)` e usa `colors.xxx` para estilizar
 * os componentes dinamicamente conforme a preferência do usuário.
 */

export const lightTheme = {
  background: '#F0F4FF',
  card: '#FFFFFF',
  primary: '#6C63FF',
  primaryLight: '#EDE9FF',
  secondary: '#FF6584',
  text: '#1A1A2E',
  textSecondary: '#666680',
  border: '#E0E0F0',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#FF5252',
  dangerLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  tabBar: '#FFFFFF',
  headerBg: '#6C63FF',
  headerText: '#FFFFFF',
  inputBg: '#F5F5FF',
  placeholder: '#AAAACC',
  shadow: '#6C63FF',
};

export const darkTheme = {
  background: '#0F0F1A',
  card: '#1E1E30',
  primary: '#7C73FF',
  primaryLight: '#2A2840',
  secondary: '#FF6584',
  text: '#E8E8FF',
  textSecondary: '#9090A8',
  border: '#2A2A40',
  success: '#4CAF50',
  successLight: '#1A2E1A',
  danger: '#FF5252',
  dangerLight: '#2E1A1A',
  warning: '#FF9800',
  warningLight: '#2E2A1A',
  tabBar: '#1E1E30',
  headerBg: '#1E1E30',
  headerText: '#E8E8FF',
  inputBg: '#2A2A40',
  placeholder: '#606080',
  shadow: '#000000',
};

// Retorna o objeto de cores com base no modo atual ('light' | 'dark')
export const getTheme = (mode) => (mode === 'dark' ? darkTheme : lightTheme);
