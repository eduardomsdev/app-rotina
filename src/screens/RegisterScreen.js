/**
 * RegisterScreen.js — Tela 2: Cadastro de novo usuário.
 *
 * Essa tela foi adicionada como um bônus — o requisito era de no mínimo
 * 5 telas, mas achei que o app ficaria incompleto sem uma tela de cadastro.
 *
 * O formulário tem 4 campos: nome, email, senha e confirmação de senha.
 * Fiz validações em duas camadas:
 *  1. Na própria tela: verificações simples (campos preenchidos, senhas iguais)
 *  2. No AppContext: validação completa via security.js antes de salvar
 *
 * Após o cadastro bem-sucedido, o usuário já fica logado automaticamente
 * (sem precisar voltar para o login e digitar tudo de novo).
 *
 * Componentes RN utilizados: View, Text, TextInput, TouchableOpacity,
 *                            KeyboardAvoidingView, ScrollView, ActivityIndicator
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

export default function RegisterScreen({ navigation }) {
  const { register, theme } = useApp();
  const colors = getTheme(theme);

  // Estados dos campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validações locais antes de chamar o contexto
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    // Confirmação de senha — verificação feita aqui na tela mesmo
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro no Cadastro', result.message);
    }
    // Se success === true, o AppContext já faz o login e o Navigator redireciona
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

        {/* Cabeçalho com botão de voltar manual
            (o header está oculto na AuthStack, então preciso fazer meu próprio) */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.titleArea}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se ao MS Productivity hoje mesmo!</Text>
          </View>
        </View>

        {/* ─── Formulário de cadastro ─── */}
        <View style={styles.formContainer}>

          {/* Campo Nome */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="João Silva"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words" // capitaliza o início de cada palavra
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Campo Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="joao@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Campo Senha */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry // esconde a senha
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Campo Confirmar Senha */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleRegister} // submete ao pressionar "done"
              />
            </View>
          </View>

          {/* Botão Criar Conta — exibe spinner durante o processamento */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          {/* Link para voltar ao login */}
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
            <Text style={styles.loginLinkText}>
              Já tem uma conta?{'  '}
              <Text style={styles.loginLinkBold}>Entrar</Text>
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
      flexGrow: 1,
      padding: 24,
    },
    header: {
      marginBottom: 28,
      paddingTop: 12,
    },
    backButton: {
      flexDirection: 'row', // ícone + texto lado a lado (Flexbox)
      alignItems: 'center',
      marginBottom: 20,
      gap: 6,
    },
    backText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    titleArea: {},
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
    },
    registerButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    loginLink: {
      alignItems: 'center',
      marginTop: 20,
      paddingVertical: 8,
    },
    loginLinkText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    loginLinkBold: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });
