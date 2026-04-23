/**
 * HomeScreen.js — Tela "Hoje": lista de hábitos do dia.
 *
 * Mudanças em relação à versão de tarefas:
 *  - "tasks" substituído por "habits"
 *  - FlatList usa HabitCard (com pontos de histórico e streak)
 *  - Filtros: Todos / Pendentes / Concluídos
 *  - Campo de busca em tempo real
 *  - Stats cards no topo (concluídos / pendentes)
 *  - FAB (botão flutuante) para adicionar novo hábito
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import { HabitService } from '../services/habitService';
import { DateUtils } from '../utils/dateUtils';
import HabitCard from '../components/HabitCard';
import EmptyList from '../components/EmptyList';

export default function HomeScreen({ navigation }) {
  const { habits, theme } = useApp();
  const colors = getTheme(theme);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all');

  const stats = HabitService.getTodayStats(habits);
  const today = DateUtils.todayKey();

  // Filtra hábitos por texto de busca e status de conclusão
  const filteredHabits = habits.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchText.toLowerCase()) ||
      h.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !h.history[today]) ||
      (filter === 'completed' && h.history[today] === true);

    return matchesSearch && matchesFilter;
  });

  const styles = createStyles(colors);

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterBtnText, filter === value && styles.filterBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ─── Cabeçalho com saudação e estatísticas ─── */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>
              {DateUtils.fullDayName().charAt(0).toUpperCase() +
                DateUtils.fullDayName().slice(1)} 🌟
            </Text>
            <Text style={styles.greetingSubtitle}>
              {stats.completed > 0
                ? `${stats.completed} de ${stats.total} hábitos feitos`
                : `${stats.total} hábito${stats.total !== 1 ? 's' : ''} para hoje`}
            </Text>
          </View>
          <Ionicons name="leaf-outline" size={36} color={colors.primaryLight} />
        </View>

        {/* Cards de estatísticas em Flexbox row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: colors.success }]}>Feitos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {stats.total - stats.completed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.warning }]}>Pendentes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.percent}%</Text>
            <Text style={[styles.statLabel, { color: colors.primary }]}>Progresso</Text>
          </View>
        </View>
      </View>

      {/* ─── Campo de busca (TextInput) ─── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar hábitos..."
          placeholderTextColor={colors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Filtros ─── */}
      <View style={styles.filterRow}>
        <FilterButton label="Todos" value="all" />
        <FilterButton label="Pendentes" value="pending" />
        <FilterButton label="Concluídos" value="completed" />
      </View>

      <Text style={styles.resultCount}>
        {filteredHabits.length} hábito{filteredHabits.length !== 1 ? 's' : ''}
      </Text>

      {/* ─── FlatList de hábitos ─── */}
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyList searchText={searchText} filter={filter} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ─── FAB para adicionar novo hábito ─── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      padding: 20,
      paddingBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    greetingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    greeting: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      textTransform: 'capitalize',
    },
    greetingSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: 12,
      paddingHorizontal: 14,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginTop: 12,
      gap: 8,
    },
    filterBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterBtnTextActive: {
      color: '#FFFFFF',
    },
    resultCount: {
      fontSize: 12,
      color: colors.textSecondary,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 10,
    },
  });
