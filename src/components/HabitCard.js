/**
 * HabitCard.js — Card de hábito para a lista do dia (HomeScreen).
 *
 * Layout (Flexbox):
 *  ┌──┬──────────────────────────────────────────────┐
 *  │▌ │ [ícone]  Nome do hábito            [  ✓  ]  │
 *  │▌ │           Descrição curta                    │
 *  │▌ │ ● ● ○ ● ● ● ●              🔥 5 dias         │
 *  └──┴──────────────────────────────────────────────┘
 *
 * Barra colorida à esquerda = prioridade visual da cor do hábito.
 * Os 7 pontos = últimos 7 dias (preenchido = feito, vazio = não feito).
 * Botão ✓ = marca/desmarca como concluído hoje sem navegar para detalhes.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import { HabitService } from '../services/habitService';

export default function HabitCard({ habit, onPress }) {
  const { toggleHabitToday, theme } = useApp();
  const colors = getTheme(theme);

  const isCompleted = HabitService.isCompletedToday(habit);
  const streak = HabitService.calculateStreak(habit.history);
  const weekData = HabitService.getWeeklyData(habit.history);

  const styles = createStyles(colors);

  return (
    // Toque no card → navega para detalhes
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Barra lateral com a cor do hábito */}
      <View style={[styles.colorBar, { backgroundColor: habit.color }]} />

      <View style={styles.content}>
        {/* ─── Linha superior: ícone + nome + botão de check ─── */}
        <View style={styles.topRow}>
          {/* Container do ícone com fundo suave da cor do hábito */}
          <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>

          {/* Nome e descrição */}
          <View style={styles.nameArea}>
            <Text
              style={[styles.name, isCompleted && styles.nameCompleted]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {habit.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}
          </View>

          {/* Botão circular de check — marca como feito hoje */}
          <TouchableOpacity
            style={[
              styles.checkButton,
              { borderColor: habit.color },
              isCompleted && { backgroundColor: habit.color },
            ]}
            onPress={() => toggleHabitToday(habit.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isCompleted ? 'checkmark' : 'add'}
              size={20}
              color={isCompleted ? '#FFFFFF' : habit.color}
            />
          </TouchableOpacity>
        </View>

        {/* ─── Linha inferior: 7 pontos do histórico + streak ─── */}
        <View style={styles.bottomRow}>
          {/* Pontinhos dos últimos 7 dias */}
          <View style={styles.weekDots}>
            {weekData.map((day, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { backgroundColor: day.completed ? habit.color : colors.border },
                  // Hoje tem uma borda de destaque
                  day.isToday && [styles.dotToday, { borderColor: habit.color }],
                ]}
              />
            ))}
          </View>

          {/* Badge de streak — só aparece se tiver pelo menos 1 dia consecutivo */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                🔥 {streak} {streak === 1 ? 'dia' : 'dias'}
              </Text>
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
      shadowRadius: 8,
      elevation: 3,
    },
    // Barra colorida de 4px à esquerda
    colorBar: {
      width: 4,
    },
    content: {
      flex: 1,
      padding: 14,
    },
    // ─── Linha superior ───
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    icon: {
      fontSize: 20,
    },
    nameArea: {
      flex: 1,
      marginRight: 8,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    // Tachado quando concluído hoje
    nameCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // ─── Linha inferior ───
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    weekDots: {
      flexDirection: 'row',
      gap: 5,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    // Hoje: bordinha de destaque e tamanho ligeiramente maior
    dotToday: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    streakBadge: {
      backgroundColor: '#FFF3E0',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    streakText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#E65100',
    },
  });
