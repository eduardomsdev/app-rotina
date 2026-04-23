/**
 * themes.js — Paletas de cores para o tema claro e escuro.
 *
 * Criei esse arquivo separado para centralizar todas as cores do app.
 * Assim, quando quero mudar uma cor, altero em um só lugar e afeta tudo.
 *
 * Cada tela chama getTheme(theme) e usa o objeto 'colors' para estilizar
 * os componentes — isso permite a troca de tema em tempo real sem recarregar.
 */

// Tema Claro — fundo azulado suave, destaque roxo
export const lightTheme = {
  background: '#F0F4FF',   // fundo da tela
  card: '#FFFFFF',          // fundo dos cards e formulários
  primary: '#6C63FF',       // cor principal (botões, destaques)
  primaryLight: '#EDE9FF',  // versão clara da cor principal (badges, fundos)
  secondary: '#FF6584',
  text: '#1A1A2E',          // texto principal
  textSecondary: '#666680', // textos de legenda, subtítulos
  border: '#E0E0F0',        // bordas de inputs e divisores
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#FF5252',
  dangerLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  tabBar: '#FFFFFF',         // fundo da barra de abas
  headerBg: '#6C63FF',       // fundo do cabeçalho de navegação
  headerText: '#FFFFFF',
  inputBg: '#F5F5FF',        // fundo dos TextInput
  placeholder: '#AAAACC',    // cor do placeholder dos inputs
  shadow: '#6C63FF',
};

// Tema Escuro — fundo escuro, mantém o roxo como cor principal
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

// Função auxiliar que retorna o tema correto baseado na preferência salva
export const getTheme = (mode) => (mode === 'dark' ? darkTheme : lightTheme);
