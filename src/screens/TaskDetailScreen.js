/**
 * TaskDetailScreen.js — Tela "Detalhes do Hábito" (rota: HabitDetail).
 *
 * Exibe:
 *  - Cabeçalho colorido com ícone, nome e streak atual
 *  - Calendário dos últimos 21 dias (3 semanas em grid 7×3)
 *  - Taxa de conclusão dos últimos 30 dias
 *  - Modo de edição: altera nome, descrição, ícone e cor
 *  - Botão de excluir com confirmação
 *
 * Segurança: atualização passa pelo updateHabit() do contexto,
 * que sanitiza e valida todos os campos antes de persistir.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import { HabitService } from '../services/habitService';
import { DateUtils } from '../utils/dateUtils';

const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '😴', '🥗',
  '💻', '✍️', '🎵', '🌿', '💊', '🙏',
  '🏋️', '🚴', '🎨', '🍎', '☕', '🧹',
  '📝', '🎯', '🛁', '🧠', '🌅', '❤️',
];

const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#FFB347', '#87CEEB', '#6C63FF',
];

export default function TaskDetailScreen({ route, navigation }) {
  const { habitId } = route.params;
  const { habits, updateHabit, deleteHabit, toggleHabitToday, theme } = useApp();
  const colors = getTheme(theme);

  const habit = habits.find((h) => h.id === habitId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [icon, setIcon] = useState(habit?.icon || '📋');
  const [selectedColor, setSelectedColor] = useState(habit?.color || '#6C63FF');

  // Botão de editar/cancelar no cabeçalho
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              setName(habit?.name || '');
              setDescription(habit?.description || '');
              setIcon(habit?.icon || '📋');
              setSelectedColor(habit?.color || '#6C63FF');
            }
            setEditing((prev) => !prev);
          }}
          style={{ marginRight: 16 }}
        >
          <Ionicons
            name={editing ? 'close-circle-outline' : 'create-outline'}
            size={24}
            color={colors.headerText}
          />
        </TouchableOpacity>
      ),
    });
  }, [editing, habit, colors.headerText]);

  if (!habit) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Hábito não encontrado.</Text>
      </View>
    );
  }

  const isCompletedToday = HabitService.isCompletedToday(habit);
  const streak = HabitService.calculateStreak(habit.history);
  const longestStreak = HabitService.calculateLongestStreak(habit.history);
  const completionRate = HabitService.getCompletionRate(habit.history);
  const historyDays = HabitService.getHistoryDays(habit.history, 21); // últimos 21 dias

  // Divide em 3 semanas (rows de 7)
  const weeks = [historyDays.slice(0, 7), historyDays.slice(7, 14), historyDays.slice(14, 21)];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome do hábito é obrigatório.');
      return;
    }
    const result = await updateHabit(habitId, {
      name: name.trim(),
      description: description.trim(),
      icon,
      color: selectedColor,
    });
    if (result.success) {
      setEditing(false);
      Alert.alert('✅ Salvo!', 'Hábito atualizado com sucesso.');
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Hábito',
      `Excluir "${habit.name}" permanentemente? Todo o histórico será perdido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);
  const accentColor = editing ? selectedColor : habit.color;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Cabeçalho colorido com ícone e stats ─── */}
      <View style={[styles.habitHeader, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
        <View style={[styles.habitIconBox, { backgroundColor: accentColor + '30' }]}>
          <Text style={styles.habitIcon}>{editing ? icon : habit.icon}</Text>
        </View>
        <View style={styles.habitHeaderInfo}>
          <Text style={[styles.habitName, { color: accentColor }]} numberOfLines={2}>
            {editing ? (name || 'Nome do hábito') : habit.name}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>🔥 {streak} {streak === 1 ? 'dia' : 'dias'}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>📊 {completionRate}%</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>🏆 {longestStreak}d</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ─── Botão de marcar hoje ─── */}
      <TouchableOpacity
        style={[styles.todayButton, { borderColor: accentColor, backgroundColor: isCompletedToday ? accentColor : 'transparent' }]}
        onPress={() => toggleHabitToday(habitId)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isCompletedToday ? '#FFFFFF' : accentColor}
        />
        <Text style={[styles.todayButtonText, { color: isCompletedToday ? '#FFFFFF' : accentColor }]}>
          {isCompletedToday ? 'Concluído hoje ✓' : 'Marcar como feito hoje'}
        </Text>
      </TouchableOpacity>

      {/* ─── Calendário de histórico (21 dias) ─── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico — últimas 3 semanas</Text>
        {weeks.map((week, wIdx) => (
          <View key={wIdx} style={styles.weekRow}>
            {week.map((day, dIdx) => (
              <View
                key={dIdx}
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: day.completed ? accentColor : colors.border,
                    borderWidth: day.isToday ? 2 : 0,
                    borderColor: accentColor,
                  },
                ]}
              >
                <Text style={[styles.calendarDayNum, { color: day.completed ? '#fff' : colors.textSecondary }]}>
                  {day.dayNumber}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {/* Legenda */}
        <View style={styles.calendarLegend}>
          <View style={[styles.legendDot, { backgroundColor: accentColor }]} />
          <Text style={styles.legendText}>Feito</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.border, marginLeft: 12 }]} />
          <Text style={styles.legendText}>Não feito</Text>
        </View>
      </View>

      {/* ─── Formulário de detalhes / edição ─── */}
      <View style={styles.card}>
        {/* Campo Nome */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nome</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do hábito"
              placeholderTextColor={colors.placeholder}
              maxLength={80}
            />
          ) : (
            <Text style={styles.fieldValue}>{habit.name}</Text>
          )}
        </View>

        <View style={styles.fieldDivider} />

        {/* Campo Descrição */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descrição</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição opcional..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
          ) : (
            <Text style={styles.fieldValue}>
              {habit.description || 'Nenhuma descrição.'}
            </Text>
          )}
        </View>

        {/* Seletores de ícone e cor (só em modo de edição) */}
        {editing && (
          <>
            <View style={styles.fieldDivider} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ícone</Text>
              <View style={styles.iconGrid}>
                {HABIT_ICONS.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    style={[
                      styles.iconOption,
                      icon === ic && { backgroundColor: selectedColor + '25', borderColor: selectedColor },
                    ]}
                    onPress={() => setIcon(ic)}
                  >
                    <Text style={styles.iconEmoji}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldDivider} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Cor</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.colorRow}>
                  {HABIT_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        selectedColor === c && styles.colorCircleSelected,
                      ]}
                      onPress={() => setSelectedColor(c)}
                    >
                      {selectedColor === c && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        <View style={styles.fieldDivider} />
        {/* Metadado: data de criação */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {'  '}Criado em {DateUtils.humanize(habit.createdAt.split('T')[0])}
          </Text>
        </View>
      </View>

      {/* ─── Botões de ação ─── */}
      {editing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setName(habit.name);
              setDescription(habit.description);
              setIcon(habit.icon);
              setSelectedColor(habit.color);
              setEditing(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: selectedColor }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={17} color="#FFF" />
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Excluir Hábito</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 16, paddingBottom: 40 },
    // ─── Cabeçalho ───
    habitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      gap: 14,
    },
    habitIconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    habitIcon: { fontSize: 28 },
    habitHeaderInfo: { flex: 1 },
    habitName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    statChip: {
      backgroundColor: 'rgba(0,0,0,0.06)',
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statChipText: { fontSize: 12, fontWeight: '600', color: colors.text },
    // ─── Botão de hoje ───
    todayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 2,
      padding: 14,
      marginBottom: 12,
      gap: 8,
    },
    todayButtonText: { fontSize: 15, fontWeight: '600' },
    // ─── Card genérico ───
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 14,
    },
    // ─── Calendário ───
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    calendarDot: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    calendarDayNum: { fontSize: 12, fontWeight: '600' },
    calendarLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: colors.textSecondary, marginLeft: 4 },
    // ─── Campos ───
    field: { paddingVertical: 8 },
    fieldDivider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    fieldValue: { fontSize: 15, color: colors.text, lineHeight: 22 },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: { height: 80, paddingTop: 12 },
    // ─── Ícones e cores (edição) ───
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    iconOption: {
      width: 42,
      height: 42,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 2,
      borderColor: colors.border,
    },
    iconEmoji: { fontSize: 20 },
    colorRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    colorCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorCircleSelected: {
      borderWidth: 3,
      borderColor: '#FFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    // ─── Metadados ───
    metaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    metaText: { fontSize: 12, color: colors.textSecondary },
    // ─── Botões ───
    buttonRow: { flexDirection: 'row', gap: 12 },
    cancelButton: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    cancelButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
    saveButton: {
      flex: 2,
      flexDirection: 'row',
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    saveButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.dangerLight,
      borderWidth: 1.5,
      borderColor: colors.danger + '40',
      gap: 8,
    },
    deleteButtonText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  });
