// Reúne funções para trabalhar com datas.

export function todayIsoDate(reference = new Date()): string {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const day = String(reference.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isPastIsoDate(value: string, reference = todayIsoDate()): boolean {
  return Boolean(value) && value < reference;
}

export function formatIsoDate(value: string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale).format(new Date(`${value}T12:00:00`));
}

export function formatShortIsoDate(value: string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(
    new Date(`${value}T12:00:00`),
  );
}

export function ageFromIsoDate(value: string, reference = new Date()): number {
  const birth = new Date(`${value}T12:00:00`);
  let age = reference.getFullYear() - birth.getFullYear();
  const hadBirthday =
    reference.getMonth() > birth.getMonth() ||
    (reference.getMonth() === birth.getMonth() && reference.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}
