/**
 * DashboardCard.js — Card expansível (acordeão / collapsible) para o Dashboard.
 *
 * Usa LayoutAnimation para animar suavemente a expansão e recolhimento do conteúdo.
 * O LayoutAnimation anima automaticamente qualquer mudança de layout na próxima
 * renderização — mais simples que Animated.Value e suficiente para este caso.
 *
 * Props:
 *  - title (string): título do card
 *  - icon (string): emoji exibido na esquerda
 *  - summary (string): texto de resumo sempre visível (subtítulo)
 *  - accentColor (string): cor da borda lateral e ícone
 *  - defaultExpanded (bool): se o card começa expandido
 *  - children: conteúdo que aparece ao expandir
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

// Habilita LayoutAnimation no Android (desabilitado por padrão no Android)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardCard({
  title,
  icon,
  summary,
  accentColor,
  defaultExpanded = false,
  children,
}) {
  const { theme } = useApp();
  const colors = getTheme(theme);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const accent = accentColor || colors.primary;

  const handleToggle = () => {
    // Configura a animação ANTES de alterar o estado
    // O React Native anima automaticamente as mudanças de layout que ocorrerem
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const styles = createStyles(colors, accent);

  return (
    <View style={styles.card}>
      {/* Barra colorida à esquerda */}
      <View style={styles.accentBar} />

      <View style={styles.cardInner}>
        {/* ─── Cabeçalho clicável ─── */}
        <TouchableOpacity
          style={styles.header}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          {/* Ícone com fundo suave */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Título e resumo */}
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {summary ? <Text style={styles.summary}>{summary}</Text> : null}
          </View>

          {/* Seta indica estado de expansão */}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* ─── Corpo expansível ─── */}
        {/* O LayoutAnimation cuida da animação — não precisamos de Animated.View */}
        {expanded && (
          <View style={styles.body}>
            <View style={styles.divider} />
            {children}
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors, accent) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    accentBar: {
      width: 4,
      backgroundColor: accent,
    },
    cardInner: {
      flex: 1,
    },
    // ─── Cabeçalho ───
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: accent + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    icon: {
      fontSize: 20,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    summary: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // ─── Corpo ───
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    body: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 12,
    },
  });
