/**
 * security.js — Utilitários de segurança do aplicativo.
 *
 * Boas práticas implementadas:
 *  1. Sanitização de inputs: remove HTML/scripts maliciosos antes de salvar
 *  2. Validação de email com regex robusto
 *  3. Validação de senha com requisito mínimo de tamanho
 *  4. Limite de comprimento em todos os campos de texto
 *  5. Nunca logar dados sensíveis em produção (__DEV__ guard)
 *  6. Dados sensíveis (senha) nunca são salvos no AsyncStorage
 *
 * NOTA sobre AsyncStorage:
 *  O AsyncStorage armazena dados em plaintext no dispositivo.
 *  Para dados realmente sensíveis (tokens JWT, senhas), use expo-secure-store
 *  que utiliza o Keychain (iOS) / Keystore (Android) do sistema operacional.
 *  Neste app, o AsyncStorage é usado apenas para dados não-sensíveis:
 *  nome, email e preferências de tema.
 */

export const Security = {
  /**
   * Sanitiza uma string removendo tags HTML e caracteres perigosos.
   * Previne que dados maliciosos sejam armazenados e re-exibidos.
   */
  sanitize(input) {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      // Remove todas as tags HTML (ex: <script>alert(1)</script>)
      .replace(/<[^>]*>/g, '')
      // Escapa caracteres especiais que podem ser usados em ataques
      .replace(/[<>&"']/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
      }[char] || char))
      // Limita o tamanho máximo para evitar payloads excessivamente grandes
      .slice(0, 500);
  },

  /**
   * Valida formato de email com regex.
   * Rejeita strings vazias, sem @ ou sem domínio válido.
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.toLowerCase().trim());
  },

  /**
   * Valida força da senha:
   *  - Mínimo 6 caracteres
   *  - Máximo 128 (previne ataques de DoS por hash de senhas longas)
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
   * Valida e sanitiza nome de usuário.
   * Mínimo 2, máximo 60 caracteres.
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
   * Valida e sanitiza nome de hábito.
   * Máximo 80 caracteres (limite razoável para um título).
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
   * Sanitiza descrição com limite maior (300 chars).
   */
  sanitizeDescription(text) {
    return this.sanitize(text || '').slice(0, 300);
  },

  /**
   * Log seguro: nunca exibe senhas ou tokens em produção.
   * Em desenvolvimento (__DEV__), mostra os dados mascarando campos sensíveis.
   */
  safeLog(data) {
    if (__DEV__) {
      const safe = { ...data };
      // Mascarar campos sensíveis antes de logar
      if (safe.password) safe.password = '[REDACTED]';
      if (safe.token) safe.token = '[REDACTED]';
      if (safe.secret) safe.secret = '[REDACTED]';
      console.log('[AppRotina Debug]', safe);
    }
    // Em produção: não logar nada (evita leakage de dados no console)
  },

  /**
   * Valida se um valor hex de cor é seguro para uso em estilos.
   * Previne que strings maliciosas sejam passadas para backgroundColor.
   */
  isValidHexColor(color) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color || '');
  },

  /**
   * Valida se um emoji é uma string simples (para o ícone do hábito).
   * Limita a 10 caracteres para evitar strings unicode excessivamente longas.
   */
  isValidIcon(icon) {
    return typeof icon === 'string' && icon.length > 0 && icon.length <= 10;
  },
};
