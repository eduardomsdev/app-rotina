/**
 * AddTaskScreen.js — Tela 5: Criar novo hábito (rota: AddHabit).
 *
 * Essa tela permite cadastrar um novo hábito com nome, descrição,
 * ícone e cor personalizados. Enquanto o usuário preenche o formulário,
 * um preview no topo mostra como o hábito vai ficar.
 *
 * Campos do formulário:
 *  - Nome do hábito (TextInput, obrigatório, máx 80 caracteres)
 *  - Descrição (TextInput multiline, opcional, máx 300 caracteres)
 *  - Seletor de ícone: grade de 24 emojis para escolher
 *  - Seletor de cor: 12 opções de cores em círculos coloridos
 *
 * Componentes RN utilizados:
 *  - View, Text: estrutura e textos
 *  - TextInput: campos de nome e descrição (requisito acadêmico)
 *  - Button: botão nativo do RN para limpar campos (requisito acadêmico)
 *  - TouchableOpacity: seletores de ícone, cor e botões de ação
 *  - ScrollView: permite scroll em telas pequenas
 *  - KeyboardAvoidingView: evita o teclado sobrepor os inputs
 *
 * Segurança: a validação e sanitização são feitas no AppContext via security.js.
 * Os limites de caracteres são aplicados tanto no TextInput (maxLength)
 * quanto no servidor (security.js) para dupla proteção.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import AppModal from '../components/AppModal';

// Grade de emojis disponíveis para o ícone do hábito
const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '😴', '🥗',
  '💻', '✍️', '🎵', '🌿', '💊', '🙏',
  '🏋️', '🚴', '🎨', '🍎', '☕', '🧹',
  '📝', '🎯', '🛁', '🧠', '🌅', '❤️',
];

// Paleta de 12 cores disponíveis para personalizar o hábito
const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#FFB347', '#87CEEB', '#6C63FF',
];

export default function AddTaskScreen({ navigation }) {
  const { addHabit, theme } = useApp();
  const colors = getTheme(theme);

  // Estados do formulário com valores padrão já selecionados
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💧');
  const [selectedColor, setSelectedColor] = useState('#45B7D1');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false });
  const showModal = (config) => setModal({ visible: true, ...config });
  const hideModal = () => setModal({ visible: false });

  // Limpa todos os campos voltando para os valores padrão
  const handleClear = () => {
    setName('');
    setDescription('');
    setSelectedIcon('💧');
    setSelectedColor('#45B7D1');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showModal({
        title: 'Campo obrigatório',
        message: 'Informe um nome para o hábito.',
        confirmText: 'OK',
        onConfirm: hideModal,
      });
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
      showModal({ title: 'Erro', message: result.message, confirmText: 'OK', onConfirm: hideModal });
      return;
    }

    // Mostra confirmação visual dentro do app antes de voltar
    showModal({
      title: '✅ Hábito criado!',
      message: `"${name.trim()}" foi adicionado à sua rotina.`,
      confirmText: 'Ver lista',
      onConfirm: () => { hideModal(); navigation.goBack(); },
    });
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

          {/* ─── Preview do hábito (atualiza em tempo real) ─── */}
          <View style={[styles.preview, { backgroundColor: selectedColor + '18', borderColor: selectedColor + '40' }]}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '30' }]}>
              <Text style={styles.previewEmoji}>{selectedIcon}</Text>
            </View>
            <View style={styles.previewText}>
              {/* Mostra um placeholder quando o campo ainda está vazio */}
              <Text style={[styles.previewName, { color: selectedColor }]} numberOfLines={1}>
                {name || 'Nome do hábito'}
              </Text>
              <Text style={styles.previewDesc} numberOfLines={1}>
                {description || 'Descrição opcional'}
              </Text>
            </View>
          </View>

          {/* ─── Campo Nome (TextInput — requisito acadêmico) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nome do Hábito *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Beber 2L de água"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              maxLength={80} // limite aplicado diretamente no input
              returnKeyType="next"
            />
            {/* Contador de caracteres para o usuário saber o limite */}
            <Text style={styles.charCount}>{name.length}/80</Text>
          </View>

          {/* ─── Campo Descrição (TextInput multiline — requisito acadêmico) ─── */}
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
              textAlignVertical="top" // no Android, começa a digitar do topo
              maxLength={300}
            />
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>

          {/* ─── Seletor de Ícone (grade de emojis) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ícone</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    // Destaca o ícone selecionado com fundo e borda na cor do hábito
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

          {/* ─── Seletor de Cor (círculos coloridos com scroll horizontal) ─── */}
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
                    {/* Checkmark visível apenas na cor selecionada */}
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ─── Button nativo do React Native (requisito acadêmico) ─── */}
          {/*
            O componente Button é o botão nativo do RN.
            Optei por usá-lo aqui para cumprir o requisito acadêmico,
            mas para os botões principais usei TouchableOpacity pois
            o Button tem menos opções de customização visual.
          */}
          <View style={styles.clearWrapper}>
            <Button
              title="🗑  Limpar Campos"
              onPress={handleClear}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {/* ─── Botões de ação (Cancelar e Criar Hábito) ─── */}
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

      {/* Modal de confirmação/alerta (campo vazio, erro, sucesso) */}
      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        colors={colors}
      />
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
      flexDirection: 'row', // ícone + textos lado a lado (Flexbox)
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
    // ─── Grade de ícones ───
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap', // quebra linha quando não cabe mais (Flexbox)
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
    // ─── Botões de ação ───
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
