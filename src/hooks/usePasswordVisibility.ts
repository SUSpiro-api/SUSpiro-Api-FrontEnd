
import { useState } from 'react';

export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  function toggleVisibility() {
    setIsVisible((visible) => !visible);
  }

  return { isVisible, toggleVisibility };
}
