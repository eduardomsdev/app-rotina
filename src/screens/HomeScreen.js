/**
 * HomeScreen.js — Tela 2: Lista de Tarefas (tela principal)
 *
 * Componentes utilizados: View, Text, TextInput (busca), FlatList, TouchableOpacity
 * Layout Flexbox: coluna principal, row para estatísticas e filtros
 *
 * Funcionalidades:
 *  - Saudação personalizada com o nome do usuário logado
 *  - Cards de estatísticas (pendentes / concluídas)
 *  - Campo de busca em tempo real
 *  - Filtros: Todas / Pendentes / Concluídas
 *  - FlatList com TaskCard para cada tarefa
 *  - FAB (Floating Action Button) para adicionar nova tarefa
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import TaskCard from '../components/TaskCard';
import EmptyList from '../components/EmptyList';

export default function HomeScreen({ navigation }) {
  const { tasks, user, theme } = useApp();
  const colors = getTheme(theme);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Filtra as tarefas combinando texto de busca e status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);

    return matchesSearch && matchesFilter;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const styles = createStyles(colors);

  // Botão de filtro reutilizável
  const FilterButton = ({ label, value, count }) => (
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
              Olá, {user?.name?.split(' ')[0] || 'usuário'}! 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              {pendingCount > 0
                ? `${pendingCount} tarefa${pendingCount !== 1 ? 's' : ''} pendente${pendingCount !== 1 ? 's' : ''}`
                : 'Tudo em dia! Continue assim 🎉'}
            </Text>
          </View>
          <Ionicons name="checkmark-done-circle" size={40} color={colors.primaryLight} />
        </View>

        {/* Cards de estatísticas — layout em row com Flexbox */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.primary }]}>Pendentes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.success }]}>Concluídas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{tasks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.warning }]}>Total</Text>
          </View>
        </View>
      </View>

      {/* ─── Campo de busca (TextInput) ─── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarefas..."
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

      {/* ─── Filtros de status ─── */}
      <View style={styles.filterRow}>
        <FilterButton label="Todas" value="all" />
        <FilterButton label="Pendentes" value="pending" />
        <FilterButton label="Concluídas" value="completed" />
      </View>

      {/* Contador de resultados visíveis */}
      <Text style={styles.resultCount}>
        {filteredTasks.length} tarefa{filteredTasks.length !== 1 ? 's' : ''}
      </Text>

      {/* ─── FlatList de tarefas ─── */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          />
        )}
        // Componente exibido quando a lista está vazia
        ListEmptyComponent={<EmptyList searchText={searchText} filter={filter} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ─── FAB: botão flutuante para adicionar nova tarefa ─── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
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
    // ─── Header ───
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
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    greetingSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // Stats em Flexbox row
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
      fontSize: 22,
      fontWeight: 'bold',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    // ─── Busca ───
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
    // ─── Lista ───
    listContent: {
      padding: 16,
      paddingBottom: 100, // espaço para o FAB não sobrepor o último card
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
