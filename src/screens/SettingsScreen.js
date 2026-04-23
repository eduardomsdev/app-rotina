/**
 * SettingsScreen.js — Tela 5: Configurações
 *
 * Componentes utilizados: View, Text, Image (avatar do usuário), Switch, TouchableOpacity, ScrollView
 * Layout Flexbox: coluna com seções agrupadas em cards
 *
 * Funcionalidades:
 *  - Perfil do usuário logado com avatar gerado dinamicamente (componente Image)
 *  - Barra de progresso mostrando % de hábitos concluídos hoje
 *  - Toggle de tema claro/escuro (Switch nativo do RN)
 *  - Estatísticas de hábitos (total / pendentes / feitos hoje)
 *  - Informações do aplicativo
 *  - Botão de logout com confirmação
 */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import { DateUtils } from '../utils/dateUtils';

export default function SettingsScreen() {
  const { user, logout, theme, toggleTheme, habits } = useApp();
  const colors = getTheme(theme);

  const today = DateUtils.todayKey();
  const completedCount = habits.filter((h) => h.history[today] === true).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair? Seus dados ficam salvos para o próximo acesso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const styles = createStyles(colors);

  // Componente de linha de configuração reutilizável
  const SettingRow = ({ icon, iconBg, label, rightContent, onPress, danger }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIconBox, { backgroundColor: iconBg || colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: colors.danger }]}>{label}</Text>
      <View style={styles.settingRight}>{rightContent}</View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Card de Perfil do Usuário (componente Image) ─── */}
      <View style={styles.profileCard}>
        {/*
          Image: exibe o avatar do usuário.
          A URL usa ui-avatars.com para gerar imagem com as iniciais do nome,
          sem precisar de nenhum arquivo de imagem local.
        */}
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6C63FF&color=fff&size=200&bold=true&rounded=true`,
          }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.profileBadge}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={styles.profileBadgeText}> Usuário Pro</Text>
          </View>
        </View>
      </View>

      {/* ─── Progresso de Hábitos de Hoje ─── */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progresso de Hoje</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? colors.success : colors.primary,
              },
            ]}
          />
        </View>

        <Text style={styles.progressSubtext}>
          {completedCount} de {totalCount} hábito{totalCount !== 1 ? 's' : ''} feito{completedCount !== 1 ? 's' : ''} hoje
        </Text>
      </View>

      {/* ─── Preferências ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.card}>
          <SettingRow
            icon={theme === 'dark' ? 'moon' : 'sunny-outline'}
            iconBg={theme === 'dark' ? '#2A2840' : '#FFF9E6'}
            label="Tema Escuro"
            rightContent={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={theme === 'dark' ? colors.primary : '#F0F0F0'}
                ios_backgroundColor={colors.border}
              />
            }
          />
        </View>
      </View>

      {/* ─── Estatísticas ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas de Hoje</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total', value: totalCount, icon: '🌱', bg: colors.primaryLight, color: colors.primary },
            { label: 'Pendentes', value: totalCount - completedCount, icon: '⏳', bg: colors.warningLight, color: colors.warning },
            { label: 'Feitos', value: completedCount, icon: '✅', bg: colors.successLight, color: colors.success },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── Sobre o App ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o Aplicativo</Text>
        <View style={styles.card}>
          <SettingRow
            icon="phone-portrait-outline"
            label="Plataforma"
            rightContent={<Text style={styles.infoValue}>React Native + Expo</Text>}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="layers-outline"
            label="Versão"
            rightContent={<Text style={styles.infoValue}>1.0.0</Text>}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="school-outline"
            label="Finalidade"
            rightContent={<Text style={styles.infoValue}>Trabalho Acadêmico</Text>}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="navigate-circle-outline"
            label="Navegação"
            rightContent={<Text style={styles.infoValue}>React Navigation v6</Text>}
          />
        </View>
      </View>

      {/* ─── Sair ─── */}
      <View style={styles.section}>
        <View style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            iconBg={colors.dangerLight}
            label="Sair da Conta"
            onPress={handleLogout}
            danger
            rightContent={
              <Ionicons name="chevron-forward" size={16} color={colors.danger} />
            }
          />
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AppRotina © 2025</Text>
        <Text style={styles.footerText}>Feito com React Native + Expo</Text>
      </View>
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
      paddingBottom: 40,
    },
    // ─── Perfil ───
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      margin: 16,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileEmail: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    profileBadgeText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
    },
    // ─── Progresso ───
    progressCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    progressTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    progressPercent: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.primary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
    },
    // ─── Seções ───
    section: {
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    // ─── Linhas de configuração ───
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
    },
    settingIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    settingRight: {
      alignItems: 'flex-end',
    },
    infoValue: {
      fontSize: 12,
      color: colors.textSecondary,
      maxWidth: 150,
      textAlign: 'right',
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 62,
    },
    // ─── Grid de estatísticas ───
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 22,
      marginBottom: 6,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    // ─── Rodapé ───
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 4,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
