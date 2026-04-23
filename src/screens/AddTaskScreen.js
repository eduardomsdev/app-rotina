/**
 * AddTaskScreen.js — Tela 3: Adicionar Nova Tarefa
 *
 * Componentes utilizados: View, Text, TextInput, Button (nativo RN), TouchableOpacity
 * Layout Flexbox: coluna, card centralizado com padding
 *
 * Funcionalidades:
 *  - Campos para título e descrição com contador de caracteres
 *  - Seleção de prioridade (baixa / média / alta)
 *  - Botão "Limpar Campos" usando o componente nativo Button do React Native
 *  - Validação antes de salvar
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Button, // ← Componente Button nativo do React Native (requisito acadêmico)
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

// Configurações dos níveis de prioridade para o seletor visual
const PRIORITIES = [
  { value: 'low', label: 'Baixa', icon: '🟢', color: '#4CAF50', desc: 'Pode esperar' },
  { value: 'medium', label: 'Média', icon: '🟡', color: '#FF9800', desc: 'Importante' },
  { value: 'high', label: 'Alta', icon: '🔴', color: '#FF5252', desc: 'Urgente' },
];

export default function AddTaskScreen({ navigation }) {
  const { addTask, theme } = useApp();
  const colors = getTheme(theme);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Limpa todos os campos do formulário
  const handleClear = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'Informe um título para a tarefa.');
      return;
    }

    setLoading(true);
    await addTask({ title: title.trim(), description: description.trim(), priority });
    setLoading(false);

    Alert.alert('✅ Tarefa criada!', 'Sua tarefa foi adicionada com sucesso.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* ─── Campo Título (TextInput) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="O que precisa ser feito?"
              placeholderTextColor={colors.placeholder}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="next"
            />
            <Text style={styles.charCount}>{title.length}/80</Text>
          </View>

          {/* ─── Campo Descrição (TextInput multiline) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalhes sobre a tarefa (opcional)..."
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>

          {/* ─── Seletor de Prioridade ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Prioridade</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityOption,
                      isSelected && {
                        borderColor: p.color,
                        backgroundColor: p.color + '18',
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.priorityIcon}>{p.icon}</Text>
                    <Text
                      style={[
                        styles.priorityLabel,
                        isSelected && { color: p.color, fontWeight: '700' },
                      ]}
                    >
                      {p.label}
                    </Text>
                    <Text style={styles.priorityDesc}>{p.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── Botão nativo Button do React Native ─── */}
          {/* Usado aqui para demonstrar o componente Button (requisito do projeto) */}
          <View style={styles.clearButtonWrapper}>
            <Button
              title="🗑  Limpar Campos"
              onPress={handleClear}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {/* ─── Botões de ação ─── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar Tarefa'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
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
      height: 110,
      paddingTop: 14,
    },
    charCount: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    // ─── Prioridade ───
    priorityRow: {
      flexDirection: 'row',
      gap: 8,
    },
    priorityOption: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    priorityIcon: {
      fontSize: 22,
      marginBottom: 4,
    },
    priorityLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    priorityDesc: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    clearButtonWrapper: {
      marginTop: 4,
    },
    // ─── Botões de ação ───
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    saveButton: {
      flex: 2,
      flexDirection: 'row',
      padding: 16,
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
    buttonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },
  });
