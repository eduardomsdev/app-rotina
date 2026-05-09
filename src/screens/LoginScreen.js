/**
 * LoginScreen.js — Tela 1: Login do usuário.
 *
 * Primeira tela que o usuário vê ao abrir o app (se não estiver logado).
 * Usei um layout centralizado com ScrollView para garantir que o conteúdo
 * não fique escondido atrás do teclado quando o usuário começar a digitar.
 *
 * Componentes RN utilizados nessa tela:
 *  - View: containers e agrupamentos de elementos
 *  - Text: textos, labels e mensagens
 *  - TextInput: campos de email e senha
 *  - Image: logo do aplicativo (requisito acadêmico)
 *  - TouchableOpacity: botões estilizados
 *  - KeyboardAvoidingView: empurra o layout para cima quando o teclado aparece
 *  - ScrollView: permite scroll se o conteúdo não couber na tela
 *  - ActivityIndicator: spinner durante o carregamento do login
 *
 * Credenciais de demonstração para teste:
 *   joao@email.com / 123456
 *   maria@email.com / 123456
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

export default function LoginScreen({ navigation }) {
  const { login, theme } = useApp();
  const colors = getTheme(theme);

  // Estados dos campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // toggle de ver senha

  const handleLogin = async () => {
    // Validação básica antes de chamar o contexto
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro de Login', result.message);
    }
    // Se success === true, o AppNavigator detecta o usuário e troca para o Tab Navigator
  };

  const styles = createStyles(colors);

  return (
    // KeyboardAvoidingView: comportamento diferente no iOS (padding) e Android (height)
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // permite tocar em botões com teclado aberto
      >

        {/* ─── Logo do aplicativo (componente Image — requisito acadêmico) ─── */}
        <View style={styles.logoContainer}>
          {/*
            Image: exibe a logo do app a partir de um arquivo local.
            Uso o require() porque a imagem fica dentro do projeto, em src/assets/.
            Isso garante que a logo carregue na hora, mesmo sem internet.
          */}
          <Image
            source={require('../assets/logo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>MS Productivity</Text>
          <Text style={styles.appSubtitle}>Organize sua vida, uma tarefa por vez</Text>
        </View>

        {/* ─── Formulário de Login ─── */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Bem-vindo de volta! 👋</Text>

          {/* Campo Email — TextInput com configurações de teclado adequadas */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address" // teclado otimizado para email
                autoCapitalize="none"         // email em minúsculas
                autoCorrect={false}           // sem autocorreção no email
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Campo Senha — TextInput com toggle para mostrar/esconder */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // esconde a senha por padrão
                returnKeyType="done"
                onSubmitEditing={handleLogin} // submete ao pressionar "done" no teclado
              />
              {/* Botão do olho para mostrar/esconder a senha */}
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão de Login — exibe spinner enquanto processa */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading} // desabilita o botão durante o carregamento
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Dica com as credenciais de demonstração para facilitar o teste */}
          <View style={styles.demoHint}>
            <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.demoHintText}>  Demo: joao@email.com / 123456</Text>
          </View>

          {/* Divisor visual entre login e cadastro */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botão de cadastro — navega para a RegisterScreen */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos criados como função para suportar os dois temas (claro/escuro)
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center', // centraliza verticalmente
      padding: 24,
    },
    // ─── Logo ───
    logoContainer: {
      alignItems: 'center', // centraliza horizontalmente (Flexbox)
      marginBottom: 36,
    },
    logo: {
      width: 96,
      height: 96,
      marginBottom: 12,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 1,
    },
    appSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    // ─── Formulário ───
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
    welcomeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 24,
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
      flexDirection: 'row', // ícone + TextInput lado a lado (Flexbox)
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
    passwordInput: {
      paddingRight: 8,
    },
    eyeButton: {
      padding: 4,
    },
    // ─── Botões ───
    loginButton: {
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
      opacity: 0.7, // feedback visual de botão desabilitado
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    demoHint: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      borderRadius: 10,
      padding: 10,
      marginTop: 14,
    },
    demoHintText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row', // linha + texto + linha (Flexbox)
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
      paddingHorizontal: 12,
      fontSize: 13,
    },
    registerButton: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    registerButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
