export function todayIsoDate(reference = new Date()): string {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const day = String(reference.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isPastIsoDate(value: string, reference = todayIsoDate()): boolean {
  return Boolean(value) && value < reference;
}

