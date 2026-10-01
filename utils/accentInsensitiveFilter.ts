/**
 * Quita diacríticos carácter por carácter para que el texto resultante
 * conserve la misma longitud que el original y los índices sigan
 * coincidiendo (Vuetify usa el índice devuelto para resaltar la coincidencia).
 */
const foldChar = (char: string): string => char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || char

const fold = (text: string): string => Array.from(text, foldChar).join('')

/**
 * Filtro para v-autocomplete / v-combobox que ignora mayúsculas y acentos:
 * "laz" encuentra "Lázaro Cárdenas". Devuelve el índice de la coincidencia
 * (-1 si no hay), igual que el filtro por defecto de Vuetify.
 */
export const accentInsensitiveFilter = (value: unknown, query: string): number => {
  if (value == null || query == null) return -1
  return fold(String(value)).indexOf(fold(String(query)))
}
