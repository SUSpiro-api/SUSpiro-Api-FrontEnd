// Cuida dos campos e do envio do agendamento de uma guia.

import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { scheduleGuide, type Guide } from '../../guides';
import { isPastIsoDate, todayIsoDate } from '../date';

interface UseGuideScheduleFormParams {
  guide: Guide | null;
  onClose: () => void;
  onScheduled: (guide: Guide) => void;
}

export function useGuideScheduleForm({ guide, onClose, onScheduled }: UseGuideScheduleFormParams) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [date, setDate] = useState(todayIsoDate());
  const [time, setTime] = useState('08:00');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!guide) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    setDate(guide.dataSolicitada >= todayIsoDate() ? guide.dataSolicitada : todayIsoDate());
    setTime('08:00');
    setError('');
    setSubmitting(false);
    dialog.showModal();

    requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    });
  }, [guide]);

  useEffect(() => {
    if (guide) return;

    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    previousFocusRef.current?.focus();
  }, [guide]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!guide) return;
    if (!date) {
      setError('Informe a data do agendamento.');
      return;
    }
    if (isPastIsoDate(date)) {
      setError('A data do agendamento não pode ser anterior à data de hoje.');
      return;
    }
    if (!time) {
      setError('Informe o horário do agendamento.');
      return;
    }

    setSubmitting(true);

    try {
      const updatedGuide = await scheduleGuide(guide.id, {
        dataAgendamento: date,
        horaAgendamento: time,
      });
      onScheduled(updatedGuide);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível concluir o agendamento. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (!submitting) onClose();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !submitting) onClose();
  }

  return {
    dialogRef,
    date,
    time,
    error,
    submitting,
    setDate,
    setTime,
    handleSubmit,
    handleCancel,
    handleDialogClick,
  };
}
