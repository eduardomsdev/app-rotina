/**
 * storage.js — Utilitário para facilitar o uso do AsyncStorage.
 *
 * O AsyncStorage só trabalha com strings, então precisei criar esse
 * arquivo para fazer a conversão JSON automaticamente em todo o app.
 *
 * Também centralizei o tratamento de erros aqui para não precisar
 * repetir o try/catch em cada lugar que salva ou lê dados.
 *
 * IMPORTANTE: o AsyncStorage guarda dados em plaintext no dispositivo.
 * Por isso, nunca salvo senhas aqui — só dados não sensíveis como
 * nome, email e preferências de tema.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {

  // Salva qualquer valor convertendo para JSON antes
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao salvar "${key}":`, error);
      return false;
    }
  },

  // Lê um valor e já converte de JSON para objeto/array automaticamente
  // Retorna null se a chave não existir (nunca lança exceção)
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[Storage] Erro ao ler "${key}":`, error);
      return null;
    }
  },

  // Remove um item específico do storage
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao remover "${key}":`, error);
      return false;
    }
  },

  // Apaga TUDO do storage — uso só no logout completo, com cuidado
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[Storage] Erro ao limpar storage:', error);
      return false;
    }
  },
};
