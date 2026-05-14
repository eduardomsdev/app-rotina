/**
 * AppModal.js — Modal de confirmação/alerta personalizado do app.
 *
 * Criei esse componente porque o Alert.alert() do React Native não
 * funciona no React Native Web (navegador). E o window.confirm/alert
 * do browser abre aquelas janelas feias do sistema.
 *
 * Com esse componente, o diálogo aparece DENTRO do app, com o mesmo
 * visual e tema (claro/escuro) do resto das telas — funciona igual
 * no celular e no navegador.
 *
 * Funciona em dois modos:
 *  - Confirmação: mostra dois botões (Cancelar + Confirmar)
 *  - Alerta simples: passa onCancel=null, mostra só um botão (OK)
 *
 * Uso:
 *   <AppModal
 *     visible={modal.visible}
 *     title="Excluir Hábito"
 *     message="Tem certeza? Essa ação não pode ser desfeita."
 *     confirmText="Excluir"
 *     danger               <- deixa o botão de confirmar vermelho
 *     onConfirm={handleDelete}
 *     onCancel={hideModal}
 *     colors={colors}
 *   />
 */
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AppModal({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
  colors,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm} // botão voltar do Android fecha o modal
    >
      {/* Fundo escurecido por trás do modal */}
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: colors.card }]}>

          {/* Título */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Mensagem */}
          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          ) : null}

          {/* Botões */}
          <View style={[styles.buttons, !onCancel && styles.singleButton]}>
            {/* Botão Cancelar — só aparece quando tem a função onCancel */}
            {onCancel ? (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Botão Confirmar — fica vermelho quando danger=true */}
            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: danger ? colors.danger : colors.primary },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Fundo semitransparente que cobre a tela inteira
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  // Caixa branca do modal
  box: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  singleButton: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  confirmBtn: {
    // cor vem por prop (primary ou danger)
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
