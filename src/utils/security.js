/**
 * security.js — Funções de segurança e validação de inputs.
 *
 * Aprendi em aula que não devemos confiar nos dados que o usuário digita.
 * Então criei esse arquivo para centralizar todas as validações e sanitizações
 * do app, seguindo algumas boas práticas de segurança mobile:
 *
 * 1. Sanitização de texto: remove tags HTML antes de salvar qualquer string
 * 2. Validação de email: regex que rejeita formatos inválidos
 * 3. Validação de senha: mínimo de 6 caracteres
 * 4. Limite de tamanho em todos os campos de texto livre
 * 5. Nunca logar dados sensíveis em produção
 * 6. Senhas nunca vão para o AsyncStorage — só nome e email
 *
 * Nota sobre o AsyncStorage: ele guarda dados em texto simples no aparelho.
 * Em um app real de produção, dados sensíveis como tokens deveriam usar o
 * expo-secure-store, que utiliza o Keychain do iOS e o Keystore do Android.
 * Para os fins desse trabalho acadêmico, o AsyncStorage é suficiente.
 */

export const Security = {

  /**
   * Remove tags HTML e caracteres perigosos de uma string.
   * Isso impede que alguém salve um script ou HTML no nome do hábito,
   * por exemplo, e esse conteúdo seja re-exibido de forma perigosa.
   */
  sanitize(input) {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      // Tira tudo que parece uma tag HTML, tipo <b>, <script>, etc.
      .replace(/<[^>]*>/g, '')
      // Escapa os caracteres especiais mais comuns em ataques web
      .replace(/[<>&"']/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
      }[char] || char))
      // Limita o tamanho máximo da string para evitar dados gigantes
      .slice(0, 500);
  },

  /**
   * Verifica se o email tem um formato válido usando expressão regular.
   * A regex exige: usuario@dominio.extensao (mínimo 2 letras na extensão).
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.toLowerCase().trim());
  },

  /**
   * Valida a senha — mínimo 6, máximo 128 caracteres.
   * O limite de 128 existe para evitar senhas absurdamente longas que
   * poderiam travar o processo de hash em servidores reais.
   */
  validatePassword(password) {
    if (!password || password.length < 6) {
      return { valid: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
    }
    if (password.length > 128) {
      return { valid: false, message: 'A senha não pode ter mais de 128 caracteres.' };
    }
    return { valid: true };
  },

  /**
   * Valida e sanitiza o nome do usuário.
   * Mínimo 2, máximo 60 caracteres — após remover espaços e HTML.
   */
  validateName(name) {
    const sanitized = this.sanitize(name);
    if (!sanitized || sanitized.length < 2) {
      return { valid: false, message: 'O nome deve ter pelo menos 2 caracteres.' };
    }
    if (sanitized.length > 60) {
      return { valid: false, message: 'O nome deve ter no máximo 60 caracteres.' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Valida e sanitiza o nome do hábito (máximo 80 caracteres).
   * 80 caracteres é suficiente para qualquer título de hábito.
   */
  validateHabitName(name) {
    const sanitized = this.sanitize(name);
    if (!sanitized || sanitized.length === 0) {
      return { valid: false, message: 'O nome do hábito é obrigatório.' };
    }
    if (sanitized.length > 80) {
      return { valid: false, message: 'O nome deve ter no máximo 80 caracteres.' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Sanitiza e limita a descrição do hábito a 300 caracteres.
   */
  sanitizeDescription(text) {
    return this.sanitize(text || '').slice(0, 300);
  },

  /**
   * Log seguro para desenvolvimento.
   * Só exibe no console em modo dev (__DEV__ = true quando rodando com Expo).
   * Mascara campos sensíveis para não aparecerem acidentalmente nos logs.
   */
  safeLog(data) {
    if (__DEV__) {
      const safe = { ...data };
      // Substitui valores sensíveis por [REDACTED] antes de logar
      if (safe.password) safe.password = '[REDACTED]';
      if (safe.token) safe.token = '[REDACTED]';
      if (safe.secret) safe.secret = '[REDACTED]';
      console.log('[AppRotina Debug]', safe);
    }
    // Em produção não loga nada — evita vazar dados no console
  },

  /**
   * Verifica se uma cor hex é válida antes de aplicar em estilos.
   * Aceita formato curto (#FFF) e longo (#FFFFFF).
   * Isso evita que uma string malformada quebre o layout do app.
   */
  isValidHexColor(color) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color || '');
  },

  /**
   * Verifica se o emoji do ícone é uma string simples e curta.
   * Limito a 10 caracteres porque emojis compostos (flags, família) podem
   * ter múltiplos code points mas ainda assim são curtos.
   */
  isValidIcon(icon) {
    return typeof icon === 'string' && icon.length > 0 && icon.length <= 10;
  },
};
