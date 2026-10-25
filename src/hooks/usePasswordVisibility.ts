// Controla se a senha aparece como texto ou fica escondida.

import { useState } from 'react';

export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  function toggleVisibility() {
    setIsVisible((visible) => !visible);
  }

  return { isVisible, toggleVisibility };
}
