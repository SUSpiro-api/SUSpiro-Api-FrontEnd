import { useEffect, useRef, useState } from 'react';

export function useFocusFirstInvalidField() {
  const formRef = useRef<HTMLFormElement>(null);
  const [focusCount, setFocusCount] = useState(0);

  useEffect(() => {
    if (focusCount === 0) return;

    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [focusCount]);

  function focusFirstInvalidField() {
    setFocusCount((count) => count + 1);
  }

  return { formRef, focusFirstInvalidField };
}
