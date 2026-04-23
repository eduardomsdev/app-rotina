/**
 * EmptyList.js — Componente exibido quando a FlatList não tem hábitos.
 *
 * Adapta a mensagem conforme o contexto:
 *  - busca ativa → "Nenhum resultado para '...'"
 *  - filtro "completed" → "Nenhum hábito concluído hoje"
 *  - filtro "pending" → "Todos os hábitos feitos hoje! 🎉"
 *  - lista vazia geral → instrução para criar o primeiro hábito
 */
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

export default function EmptyList({ searchText, filter }) {
  const { theme } = useApp();
  const colors = getTheme(theme);

  const getMessage = () => {
    if (searchText) {
      return {
        icon: '🔍',
        title: 'Nenhum resultado',
        subtitle: `Não encontramos hábitos para "${searchText}"`,
      };
    }
    if (filter === 'completed') {
      return {
        icon: '🎯',
        title: 'Nenhum hábito concluído hoje',
        subtitle: 'Marque seus hábitos como feitos e eles aparecerão aqui.',
      };
    }
    if (filter === 'pending') {
      return {
        icon: '🎉',
        title: 'Missão cumprida!',
        subtitle: 'Todos os hábitos de hoje foram concluídos. Incrível!',
      };
    }
    return {
      icon: '🌱',
      title: 'Nenhum hábito ainda',
      subtitle: 'Toque no + para criar seu primeiro hábito e começar sua jornada.',
    };
  };

  const { icon, title, subtitle } = getMessage();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    icon: {
      fontSize: 60,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
