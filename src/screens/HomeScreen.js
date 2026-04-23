/**
 * HomeScreen.js — Tela 4: Lista de hábitos do dia (aba "Hoje").
 *
 * Essa é a tela que o usuário vai usar mais no dia a dia.
 * Ela mostra todos os hábitos e permite marcar cada um como feito
 * diretamente pelo botão de check no HabitCard, sem precisar abrir os detalhes.
 *
 * Funcionalidades implementadas:
 *  - Cards de estatísticas no topo (feitos / pendentes / % de progresso)
 *  - Campo de busca em tempo real (filtra enquanto o usuário digita)
 *  - Filtros por status: Todos / Pendentes / Concluídos
 *  - FlatList com os HabitCards filtrados
 *  - FAB (botão flutuante) no canto inferior para adicionar novo hábito
 *  - Componente EmptyList quando nenhum hábito corresponde ao filtro
 *
 * Componentes RN utilizados:
 *  - View: todos os containers e agrupamentos
 *  - Text: saudação, contadores, labels
 *  - FlatList: lista de hábitos (requisito acadêmico)
 *  - TextInput: campo de busca
 *  - TouchableOpacity: botões de filtro e FAB
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

  // Estados dos filtros da lista
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Calcula as estatísticas do dia atual para os cards do topo
  const stats = HabitService.getTodayStats(habits);
  const today = DateUtils.todayKey();

  /**
   * Filtra os hábitos com base no texto de busca e no filtro selecionado.
   * A busca verifica nome e descrição ao mesmo tempo.
   * O filtro de status usa o history do dia de hoje.
   */
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

  // Componente de botão de filtro reutilizável (definido aqui pois usa o estado 'filter')
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

      {/* ─── Cabeçalho com saudação e cards de estatísticas ─── */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            {/* Saudação com o nome do dia da semana por extenso */}
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

        {/* Cards de estatísticas em Flexbox row — Feitos / Pendentes / Progresso */}
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

      {/* ─── Campo de busca (TextInput — requisito acadêmico) ─── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar hábitos..."
          placeholderTextColor={colors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {/* Botão de limpar a busca — só aparece quando há texto digitado */}
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Botões de filtro ─── */}
      <View style={styles.filterRow}>
        <FilterButton label="Todos" value="all" />
        <FilterButton label="Pendentes" value="pending" />
        <FilterButton label="Concluídos" value="completed" />
      </View>

      {/* Contador de resultados */}
      <Text style={styles.resultCount}>
        {filteredHabits.length} hábito{filteredHabits.length !== 1 ? 's' : ''}
      </Text>

      {/* ─── FlatList de hábitos (requisito acadêmico) ─── */}
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

      {/* ─── FAB (Floating Action Button) para adicionar novo hábito ─── */}
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
    // ─── Cabeçalho ───
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
      flexDirection: 'row',        // saudação + ícone lado a lado (Flexbox)
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
      flexDirection: 'row', // três cards lado a lado (Flexbox)
      gap: 10,
    },
    statCard: {
      flex: 1,           // cada card ocupa espaço igual
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
    // ─── Campo de busca ───
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
    // ─── Filtros ───
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
      paddingBottom: 100, // espaço extra para o FAB não cobrir o último card
    },
    // ─── FAB ───
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
