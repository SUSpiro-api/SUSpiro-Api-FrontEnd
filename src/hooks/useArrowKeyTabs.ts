// Permite trocar de aba com as setas do teclado.

import { useRef, type KeyboardEvent } from 'react';

export function useArrowKeyTabs<T extends string>(values: T[], onChange: (value: T) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Partial<Record<string, number>> = {
      ArrowLeft: -1, ArrowRight: 1, Home: -index, End: values.length - 1 - index,
    };
    const move = moves[event.key];
    if (move === undefined || values.length === 0) return;
    event.preventDefault();
    const nextIndex = (index + move + values.length) % values.length;
    onChange(values[nextIndex]);
    refs.current[nextIndex]?.focus();
  }

  return { refs, handleKeyDown };
}
