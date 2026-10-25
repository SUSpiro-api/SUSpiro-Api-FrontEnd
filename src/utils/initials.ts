// Devolve as iniciais do nome para usar em avatares.

export function initialsFromName(name?: string | null): string {
  if (!name) return '';

  const words = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    // Ignora abreviações como "Dra." e "Sr." para usar nomes de verdade.
    .filter((word) => !word.endsWith('.'));

  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
