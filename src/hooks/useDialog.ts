import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react';

interface UseDialogParams {
  isOpen: boolean;
  focusSelector?: string;
  onClose: () => void;
  canClose?: boolean;
}

export function useDialog({ isOpen, focusSelector, onClose, canClose = true }: UseDialogParams) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!isOpen) {
      if (dialog?.open) dialog.close();
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
      previousFocusRef.current = null;
      return;
    }

    if (!dialog) return;

    if (!dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
    }

    const frameId = window.requestAnimationFrame(() => {
      if (dialog.open && focusSelector) dialog.querySelector<HTMLElement>(focusSelector)?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen, focusSelector]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (canClose) onClose();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && canClose) onClose();
  }

  return { dialogRef, handleCancel, handleDialogClick };
}
