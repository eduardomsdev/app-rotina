/**
 * EmptyList.js — Componente exibido quando a FlatList não tem hábitos para mostrar.
 *
 * Em vez de mostrar uma lista vazia sem explicação, esse componente exibe
 * uma mensagem amigável e contextual dependendo do motivo da lista estar vazia.
 *
 * Há três situações possíveis:
 *  1. O usuário pesquisou algo que não existe → "Nenhum resultado para '...'"
 *  2. Filtro 'concluídos' ativo mas nenhum feito → "Nenhum hábito concluído hoje"
 *  3. Filtro 'pendentes' ativo mas todos feitos → "Missão cumprida! 🎉"
 *  4. Lista realmente vazia → "Nenhum hábito ainda. Toque no + para criar."
 *
 * Esse componente é passado na prop ListEmptyComponent da FlatList.
 *
 * Componentes RN utilizados: View, Text
 */
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

export default function EmptyList({ searchText, filter }) {
  const { theme } = useApp();
  const colors = getTheme(theme);

  // Define o ícone, título e subtítulo conforme o contexto atual da lista
  const getMessage = () => {
    if (searchText) {
      // Usuário está buscando algo que não existe
      return {
        icon: '🔍',
        title: 'Nenhum resultado',
        subtitle: `Não encontramos hábitos para "${searchText}"`,
      };
    }
    if (filter === 'completed') {
      // Filtro de concluídos ativo, mas nenhum foi feito hoje
      return {
        icon: '🎯',
        title: 'Nenhum hábito concluído hoje',
        subtitle: 'Marque seus hábitos como feitos e eles aparecerão aqui.',
      };
    }
    if (filter === 'pending') {
      // Filtro de pendentes ativo, mas todos já foram feitos — ótimo!
      return {
        icon: '🎉',
        title: 'Missão cumprida!',
        subtitle: 'Todos os hábitos de hoje foram concluídos. Incrível!',
      };
    }
    // Lista completamente vazia — usuário ainda não criou nenhum hábito
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
