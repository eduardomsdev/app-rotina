/**
 * TaskCard.js — Componente de card para cada tarefa na FlatList.
 *
 * Exibe: título, descrição, badge de prioridade, data de criação e status.
 * O botão circular marca/desmarca a tarefa como concluída sem navegar para os detalhes.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

// Configuração visual por nível de prioridade
const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: '#FF5252', bg: '#FFEBEE' },
  medium: { label: 'Média', color: '#FF9800', bg: '#FFF3E0' },
  low: { label: 'Baixa', color: '#4CAF50', bg: '#E8F5E9' },
};

export default function TaskCard({ task, onPress }) {
  const { toggleTaskComplete, theme } = useApp();
  const colors = getTheme(theme);
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const formattedDate = new Date(task.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const styles = createStyles(colors);

  return (
    // TouchableOpacity como container torna o card inteiro clicável (navega para detalhes)
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Barra colorida lateral indica a prioridade visualmente */}
      <View style={[styles.priorityBar, { backgroundColor: priority.color }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          {/* Badge de texto com a prioridade */}
          <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>

          {/* Botão circular para marcar como concluída sem abrir os detalhes */}
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => toggleTaskComplete(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={task.completed ? colors.success : colors.border}
            />
          </TouchableOpacity>
        </View>

        {/* Título riscado quando concluída */}
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {/* Descrição com no máximo 2 linhas */}
        <Text style={styles.description} numberOfLines={2}>
          {task.description || 'Sem descrição'}
        </Text>

        {/* Rodapé: data + badge "Concluída" */}
        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.date}>{formattedDate}</Text>
          {task.completed && (
            <View style={[styles.completedBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.completedText, { color: colors.success }]}>✓ Concluída</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3,
    },
    // Barra lateral colorida (4px de largura)
    priorityBar: {
      width: 4,
    },
    content: {
      flex: 1,
      padding: 14,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priorityBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    checkButton: {},
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    // Aplica tachado e opacidade quando a tarefa está concluída
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 4,
    },
    date: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
    },
    completedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    completedText: {
      fontSize: 10,
      fontWeight: '700',
    },
  });
