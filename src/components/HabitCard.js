/**
 * HabitCard.js — Card de hábito exibido na lista do dia (HomeScreen).
 *
 * Esse componente foi um dos que mais trabalhei no projeto. Ele precisa
 * mostrar muita informação de forma compacta e ainda ser fácil de usar.
 *
 * Layout Flexbox (da esquerda para a direita):
 * ┌──┬──────────────────────────────────────────────┐
 * │▌ │ [ícone]  Nome do hábito            [  ✓  ]  │
 * │▌ │           Descrição opcional                 │
 * │▌ │ ● ● ○ ● ● ● ●              🔥 5 dias         │
 * └──┴──────────────────────────────────────────────┘
 *
 * A barra colorida de 4px na esquerda usa a cor personalizada do hábito.
 * Os 7 pontinhos mostram os últimos 7 dias: preenchido = feito, vazio = não feito.
 * O pontinho de hoje tem uma borda extra para se destacar.
 * O botão circular ✓ marca/desmarca o hábito sem precisar entrar nos detalhes.
 *
 * Componentes RN utilizados: View, Text, TouchableOpacity
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

  // Calcula os dados que preciso exibir no card
  const isCompleted = HabitService.isCompletedToday(habit);
  const streak = HabitService.calculateStreak(habit.history);
  const weekData = HabitService.getWeeklyData(habit.history);

  const styles = createStyles(colors);

  return (
    // Toque no card abre a tela de detalhes do hábito
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>

      {/* Barra colorida de 4px no lado esquerdo — usa a cor personalizada do hábito */}
      <View style={[styles.colorBar, { backgroundColor: habit.color }]} />

      <View style={styles.content}>

        {/* ─── Linha superior: ícone + nome + botão de check ─── */}
        <View style={styles.topRow}>

          {/* Container do ícone com fundo suave (cor do hábito com 20% de opacidade) */}
          <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>

          {/* Nome e descrição do hábito — numberOfLines evita overflow */}
          <View style={styles.nameArea}>
            <Text
              style={[styles.name, isCompleted && styles.nameCompleted]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {/* Só exibe a descrição se ela existir */}
            {habit.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}
          </View>

          {/* Botão de check circular — preenchido com a cor do hábito quando concluído */}
          <TouchableOpacity
            style={[
              styles.checkButton,
              { borderColor: habit.color },
              isCompleted && { backgroundColor: habit.color }, // fundo cheio quando feito
            ]}
            onPress={() => toggleHabitToday(habit.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // área de toque maior
          >
            <Ionicons
              name={isCompleted ? 'checkmark' : 'add'}
              size={20}
              color={isCompleted ? '#FFFFFF' : habit.color}
            />
          </TouchableOpacity>
        </View>

        {/* ─── Linha inferior: 7 pontinhos do histórico + badge de streak ─── */}
        <View style={styles.bottomRow}>

          {/* Um pontinho para cada um dos últimos 7 dias */}
          <View style={styles.weekDots}>
            {weekData.map((day, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { backgroundColor: day.completed ? habit.color : colors.border },
                  // Hoje tem borda de destaque e fica um pouco maior
                  day.isToday && [styles.dotToday, { borderColor: habit.color }],
                ]}
              />
            ))}
          </View>

          {/* Badge de streak — só aparece se houver pelo menos 1 dia consecutivo */}
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

// Estilos criados como função para suportar troca de tema
const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: 'row', // barra lateral + conteúdo lado a lado (Flexbox)
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    // Barra colorida fina na esquerda do card
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
    // Quando concluído, o nome aparece tachado
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
    // O pontinho de hoje é levemente maior e tem borda para se destacar
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
