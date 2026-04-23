/**
 * EmptyList.js — Componente exibido quando a FlatList não tem itens.
 *
 * Adapta a mensagem conforme o contexto:
 *  - busca ativa → "Nenhum resultado"
 *  - filtro "completed" → "Nenhuma tarefa concluída"
 *  - filtro "pending" + lista vazia → "Tudo em dia!"
 *  - lista vazia geral → instrução para criar a primeira tarefa
 */
import React from 'react';
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
        subtitle: `Não encontramos tarefas para "${searchText}"`,
      };
    }
    if (filter === 'completed') {
      return {
        icon: '🎯',
        title: 'Nenhuma tarefa concluída',
        subtitle: 'Complete suas tarefas e elas aparecerão aqui.',
      };
    }
    if (filter === 'pending') {
      return {
        icon: '🎉',
        title: 'Tudo em dia!',
        subtitle: 'Todas as suas tarefas foram concluídas. Parabéns!',
      };
    }
    return {
      icon: '📋',
      title: 'Nenhuma tarefa ainda',
      subtitle: 'Toque no botão + para criar sua primeira tarefa.',
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
