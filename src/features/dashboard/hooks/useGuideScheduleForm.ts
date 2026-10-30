import { useEffect, useState, type FormEvent } from 'react';
import { useDialog } from '../../../hooks/useDialog';
import { ApiError } from '../../../api/httpClient';
import { scheduleGuide, type Guide } from '../../guides';
import { isPastIsoDate, todayIsoDate } from '../date';

interface UseGuideScheduleFormParams {
  guide: Guide | null;
  onClose: () => void;
  onScheduled: (guide: Guide) => void;
}

export function useGuideScheduleForm({ guide, onClose, onScheduled }: UseGuideScheduleFormParams) {
  const [date, setDate] = useState(todayIsoDate());
  const [time, setTime] = useState('08:00');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [clinicState, setClinicState] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialog = useDialog({ isOpen: Boolean(guide), focusSelector: '[data-autofocus]', onClose, canClose: !submitting });

  useEffect(() => {
    if (!guide) return;
    setDate(guide.dataSolicitada >= todayIsoDate() ? guide.dataSolicitada : todayIsoDate());
    setTime('08:00');
    setClinicName(guide.estabelecimentoNome ?? '');
    setClinicAddress(guide.estabelecimentoEndereco ?? '');
    setClinicCity(guide.estabelecimentoCidade ?? '');
    setClinicState(guide.estabelecimentoEstado ?? '');
    setError('');
    setSubmitting(false);
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
    if (!clinicName.trim() || !clinicAddress.trim() || !clinicCity.trim() || clinicState.trim().length !== 2) {
      setError('Informe o nome da unidade, o endereço, a cidade e a UF para concluir o agendamento.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedGuide = await scheduleGuide(guide.id, {
        dataAgendamento: date,
        horaAgendamento: time,
        estabelecimentoNome: clinicName.trim(),
        estabelecimentoEndereco: clinicAddress.trim(),
        estabelecimentoCidade: clinicCity.trim(),
        estabelecimentoEstado: clinicState.trim().toUpperCase(),
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

  return {
    dialogRef: dialog.dialogRef,
    handleCancel: dialog.handleCancel,
    handleDialogClick: dialog.handleDialogClick,
    date,
    time,
    error,
    submitting,
    clinicName,
    clinicAddress,
    clinicCity,
    clinicState,
    setDate,
    setTime,
    setClinicName,
    setClinicAddress,
    setClinicCity,
    setClinicState: (value: string) => setClinicState(value.toUpperCase().slice(0, 2)),
    handleSubmit,
  };
}
