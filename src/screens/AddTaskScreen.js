/**
 * AddTaskScreen.js — Tela "Novo Hábito" (rota: AddHabit).
 *
 * Campos:
 *  - Nome do hábito (TextInput, obrigatório, máx 80 chars)
 *  - Descrição (TextInput multiline, opcional, máx 300 chars)
 *  - Seletor de ícone (grid de emojis)
 *  - Seletor de cor (linha de círculos coloridos)
 *
 * Segurança:
 *  - Validação e sanitização feitas no AppContext via security.js
 *  - Limites de caracteres aplicados no TextInput (maxLength)
 *  - Button nativo do React Native para "Limpar Campos" (requisito acadêmico)
 */
import { useState } from 'react';
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
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

// Ícones disponíveis para o hábito
const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '😴', '🥗',
  '💻', '✍️', '🎵', '🌿', '💊', '🙏',
  '🏋️', '🚴', '🎨', '🍎', '☕', '🧹',
  '📝', '🎯', '🛁', '🧠', '🌅', '❤️',
];

// Cores disponíveis para o hábito
const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#FFB347', '#87CEEB', '#6C63FF',
];

export default function AddTaskScreen({ navigation }) {
  const { addHabit, theme } = useApp();
  const colors = getTheme(theme);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💧');
  const [selectedColor, setSelectedColor] = useState('#45B7D1');
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setName('');
    setDescription('');
    setSelectedIcon('💧');
    setSelectedColor('#45B7D1');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe um nome para o hábito.');
      return;
    }

    setLoading(true);
    const result = await addHabit({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.message);
      return;
    }

    Alert.alert('✅ Hábito criado!', `"${name.trim()}" foi adicionado à sua rotina.`, [
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
          {/* ─── Preview do hábito ─── */}
          <View style={[styles.preview, { backgroundColor: selectedColor + '18', borderColor: selectedColor + '40' }]}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '30' }]}>
              <Text style={styles.previewEmoji}>{selectedIcon}</Text>
            </View>
            <View style={styles.previewText}>
              <Text style={[styles.previewName, { color: selectedColor }]} numberOfLines={1}>
                {name || 'Nome do hábito'}
              </Text>
              <Text style={styles.previewDesc} numberOfLines={1}>
                {description || 'Descrição opcional'}
              </Text>
            </View>
          </View>

          {/* ─── Campo Nome (TextInput) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nome do Hábito *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Beber 2L de água"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              maxLength={80}
              returnKeyType="next"
            />
            <Text style={styles.charCount}>{name.length}/80</Text>
          </View>

          {/* ─── Campo Descrição (TextInput multiline) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalhes sobre o hábito (opcional)..."
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>

          {/* ─── Seletor de Ícone ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ícone</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && {
                      backgroundColor: selectedColor + '25',
                      borderColor: selectedColor,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── Seletor de Cor ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorRow}>
                {HABIT_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCircleSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ─── Botão nativo Button (requisito acadêmico) ─── */}
          <View style={styles.clearWrapper}>
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
            style={[styles.saveButton, { backgroundColor: selectedColor }, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Criar Hábito'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 16 },
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
    // ─── Preview ───
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      gap: 12,
    },
    previewIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewEmoji: { fontSize: 26 },
    previewText: { flex: 1 },
    previewName: { fontSize: 16, fontWeight: '700' },
    previewDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    // ─── Campos ───
    section: { marginBottom: 20 },
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
    textArea: { height: 90, paddingTop: 14 },
    charCount: { fontSize: 11, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },
    // ─── Grid de ícones ───
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    iconOption: {
      width: 46,
      height: 46,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 2,
      borderColor: colors.border,
    },
    iconEmoji: { fontSize: 22 },
    // ─── Seletor de cor ───
    colorRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
    colorCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorCircleSelected: {
      borderWidth: 3,
      borderColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    clearWrapper: { marginTop: 4 },
    // ─── Botões ───
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    cancelButtonText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
    saveButton: {
      flex: 2,
      flexDirection: 'row',
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  });
