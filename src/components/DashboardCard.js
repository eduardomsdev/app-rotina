/**
 * DashboardCard.js — Card expansível (acordeão) usado no Dashboard.
 *
 * A ideia desse componente é mostrar um resumo sempre visível no cabeçalho
 * e, ao tocar, expandir o corpo com os detalhes. Isso mantém o Dashboard
 * organizado sem sobrecarregar o usuário com informação de uma vez.
 *
 * Para a animação de expandir/recolher, usei o LayoutAnimation do React Native.
 * Ele funciona assim: antes de mudar o estado, eu configuro a animação;
 * o React Native então anima automaticamente qualquer mudança de layout
 * que acontecer na próxima renderização. É mais simples do que usar
 * Animated.Value manualmente e resolve bem para esse caso.
 *
 * No Android, o LayoutAnimation precisa ser habilitado explicitamente com
 * UIManager.setLayoutAnimationEnabledExperimental — isso é feito fora do
 * componente para rodar uma única vez quando o módulo é carregado.
 *
 * Props recebidas:
 *  - title: string — título exibido no cabeçalho do card
 *  - icon: string — emoji à esquerda do título
 *  - summary: string — subtítulo sempre visível
 *  - accentColor: string — cor da barra lateral e do fundo do ícone
 *  - defaultExpanded: boolean — começa aberto? (padrão: fechado)
 *  - children: conteúdo que aparece ao expandir
 *
 * Componentes RN utilizados: View, Text, TouchableOpacity, LayoutAnimation
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

// Habilita LayoutAnimation no Android (vem desabilitado por padrão)
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

  // Usa a cor de destaque passada via prop, ou a cor primária do tema como fallback
  const accent = accentColor || colors.primary;

  const handleToggle = () => {
    // IMPORTANTE: precisa configurar a animação ANTES de alterar o estado.
    // O LayoutAnimation captura o estado atual do layout e anima até o novo.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const styles = createStyles(colors, accent);

  return (
    <View style={styles.card}>
      {/* Barra colorida de 4px no lado esquerdo do card */}
      <View style={styles.accentBar} />

      <View style={styles.cardInner}>

        {/* ─── Cabeçalho clicável (sempre visível) ─── */}
        <TouchableOpacity
          style={styles.header}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          {/* Ícone com fundo suave na cor de destaque */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Título e subtítulo resumo */}
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {summary ? <Text style={styles.summary}>{summary}</Text> : null}
          </View>

          {/* Seta que muda de direção para indicar o estado */}
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

// Os estilos recebem tanto o tema quanto a cor de destaque como parâmetros
const createStyles = (colors, accent) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row', // barra lateral + conteúdo (Flexbox)
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
    // Barra colorida fina na esquerda
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
      backgroundColor: accent + '18', // fundo com 18% de opacidade
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
