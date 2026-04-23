/**
 * TaskDetailScreen.js — Tela 4: Detalhes e Edição da Tarefa
 *
 * Componentes utilizados: View, Text, TextInput, TouchableOpacity, ScrollView
 * Funcionalidades:
 *  - Exibe todos os dados da tarefa selecionada
 *  - Botão no header alterna entre modo de visualização e edição
 *  - Marcar / desmarcar como concluída
 *  - Editar título, descrição e prioridade
 *  - Excluir tarefa com confirmação via Alert
 */
import React, { useState, useEffect } from 'react';
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

const PRIORITIES = [
  { value: 'low', label: 'Baixa', icon: '🟢', color: '#4CAF50' },
  { value: 'medium', label: 'Média', icon: '🟡', color: '#FF9800' },
  { value: 'high', label: 'Alta', icon: '🔴', color: '#FF5252' },
];

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { tasks, updateTask, deleteTask, toggleTaskComplete, theme } = useApp();
  const colors = getTheme(theme);

  // Busca a tarefa atual pelo id recebido nos parâmetros de rota
  const task = tasks.find((t) => t.id === taskId);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');

  // Adiciona botão de editar/cancelar no cabeçalho de forma dinâmica
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              // Ao cancelar, restaura os valores originais
              setTitle(task?.title || '');
              setDescription(task?.description || '');
              setPriority(task?.priority || 'medium');
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
  }, [editing, task, colors.headerText]);

  // Tarefa não encontrada (pode ter sido excluída em paralelo)
  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Tarefa não encontrada.</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'O título não pode ser vazio.');
      return;
    }
    await updateTask(taskId, {
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    setEditing(false);
    Alert.alert('✅ Salvo!', 'Tarefa atualizada com sucesso.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      `Deseja excluir permanentemente "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const currentPriority = PRIORITIES.find((p) => p.value === (editing ? priority : task.priority));

  const formattedDate = new Date(task.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Card de status ─── */}
      <View style={styles.statusCard}>
        {/* Botão para marcar/desmarcar como concluída */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => toggleTaskComplete(taskId)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={34}
            color={task.completed ? colors.success : colors.textSecondary}
          />
          <Text style={[styles.statusText, task.completed && { color: colors.success }]}>
            {task.completed ? 'Concluída ✓' : 'Marcar como Concluída'}
          </Text>
        </TouchableOpacity>

        {/* Badge de prioridade */}
        <View style={[styles.priorityChip, { backgroundColor: currentPriority?.color + '20' }]}>
          <Text style={styles.priorityChipIcon}>{currentPriority?.icon}</Text>
          <Text style={[styles.priorityChipText, { color: currentPriority?.color }]}>
            {currentPriority?.label}
          </Text>
        </View>
      </View>

      {/* ─── Card de detalhes ─── */}
      <View style={styles.detailCard}>
        {/* Campo Título */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Título</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título da tarefa"
              placeholderTextColor={colors.placeholder}
              maxLength={80}
            />
          ) : (
            <Text style={[styles.fieldValue, task.completed && styles.textCompleted]}>
              {task.title}
            </Text>
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
              placeholder="Descreva os detalhes da tarefa..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
          ) : (
            <Text style={styles.fieldValue}>
              {task.description || 'Nenhuma descrição informada.'}
            </Text>
          )}
        </View>

        {/* Seletor de prioridade (visível apenas no modo de edição) */}
        {editing && (
          <>
            <View style={styles.fieldDivider} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Prioridade</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityOption,
                      priority === p.value && {
                        borderColor: p.color,
                        backgroundColor: p.color + '18',
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.priorityOptionIcon}>{p.icon}</Text>
                    <Text
                      style={[
                        styles.priorityOptionLabel,
                        priority === p.value && { color: p.color, fontWeight: '700' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.fieldDivider} />

        {/* Metadados: data de criação */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>Criada em {formattedDate}</Text>
        </View>
      </View>

      {/* ─── Botões de ação ─── */}
      {editing ? (
        // Modo edição: Cancelar + Salvar
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setTitle(task.title);
              setDescription(task.description);
              setPriority(task.priority);
              setEditing(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="save-outline" size={17} color="#FFF" />
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Modo visualização: apenas botão de excluir
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Excluir Tarefa</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    // ─── Status Card ───
    statusCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statusText: {
      marginLeft: 10,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
    },
    priorityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 4,
    },
    priorityChipIcon: {
      fontSize: 14,
    },
    priorityChipText: {
      fontSize: 12,
      fontWeight: '700',
    },
    // ─── Detail Card ───
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    field: {
      marginBottom: 4,
      paddingVertical: 8,
    },
    fieldDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    fieldValue: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    textCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      paddingTop: 14,
    },
    // ─── Prioridade (edit mode) ───
    priorityRow: {
      flexDirection: 'row',
      gap: 8,
    },
    priorityOption: {
      flex: 1,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    priorityOptionIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    priorityOptionLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    // ─── Metadados ───
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
    },
    metaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    // ─── Botões ───
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    saveButton: {
      flex: 2,
      flexDirection: 'row',
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    saveButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
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
    deleteButtonText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '600',
    },
  });
