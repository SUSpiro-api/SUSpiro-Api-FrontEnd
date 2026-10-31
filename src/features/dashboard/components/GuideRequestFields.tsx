import type { ChangeEvent } from 'react';
import type { ConsultationSpecialty } from '../../guides';
import type { ScheduleType } from '../types';

interface GuideRequestFieldsProps {
  type: ScheduleType;
  specialty: ConsultationSpecialty | '';
  date: string;
  detail: string;
  observation: string;
  priority: 'normal' | 'urgente';
  today: string;
  specialtyLabels: Record<string, string>;
  specialtyOptions: readonly string[];
  examGroups: readonly { label: string; options: readonly string[] }[];
  onSpecialty: (value: ConsultationSpecialty) => void;
  onDate: (value: string) => void;
  onDetail: (value: string) => void;
  onObservation: (value: string) => void;
  onPriority: (value: 'normal' | 'urgente') => void;
}

const detailLabels: Partial<Record<ScheduleType, string>> = {
  exame: 'Exame solicitado',
  encaminhamento: 'Especialidade de destino',
};

export function GuideRequestFields(props: GuideRequestFieldsProps) {
  const {
    type, specialty, date, detail, observation, priority, today,
    specialtyLabels, specialtyOptions, examGroups,
    onSpecialty, onDate, onDetail, onObservation, onPriority,
  } = props;

  const clearOnChange = <T extends string>(setter: (value: T) => void) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setter(event.target.value as T);

  return (
    <div className="schedule-form__grid">
      <div className="ui-field">
        <label className="ui-field__label" htmlFor="schedule-date">Data solicitada</label>
        <input id="schedule-date" className="ui-field__input" type="date" min={today} value={date} onChange={clearOnChange(onDate)} required />
        <p className="ui-field__hint">A data de hoje ou uma data futura.</p>
      </div>

      {type === 'consulta' && (
        <div className="ui-field">
          <label className="ui-field__label" htmlFor="schedule-consultation-specialty">Especialidade da consulta</label>
          <div className="ui-field__control ui-field__control--select">
            <select id="schedule-consultation-specialty" className="ui-field__input ui-field__select" value={specialty} onChange={clearOnChange(onSpecialty)} required>
              <option value="" disabled>Selecione a especialidade</option>
              {Object.entries(specialtyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <p className="ui-field__hint">Informe a especialidade médica responsável pelo atendimento.</p>
        </div>
      )}

      {type === 'encaminhamento' && (
        <div className="ui-field">
          <label className="ui-field__label" htmlFor="schedule-detail">{detailLabels.encaminhamento}</label>
          <div className="ui-field__control ui-field__control--select">
            <select id="schedule-detail" className="ui-field__input ui-field__select" value={detail} onChange={clearOnChange(onDetail)} required>
              <option value="" disabled>Selecione a especialidade</option>
              {specialtyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
      )}

      {type === 'exame' && (
        <div className="ui-field">
          <label className="ui-field__label" htmlFor="schedule-detail">{detailLabels.exame}</label>
          <div className="ui-field__control ui-field__control--select">
            <select id="schedule-detail" className="ui-field__input ui-field__select" value={detail} onChange={clearOnChange(onDetail)} required>
              <option value="" disabled>Selecione o exame</option>
              {examGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((exam) => <option key={exam} value={exam}>{exam}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="ui-field">
        <label className="ui-field__label" htmlFor="schedule-priority">Prioridade</label>
        <div className="ui-field__control ui-field__control--select">
          <select id="schedule-priority" className="ui-field__input ui-field__select" value={priority} onChange={clearOnChange(onPriority)}>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      <div className="ui-field schedule-form__full">
        <label className="ui-field__label" htmlFor="schedule-observation">Observação</label>
        <textarea id="schedule-observation" className="ui-field__input schedule-modal__textarea" value={observation} placeholder="Registre uma observação relevante para a equipe responsável pelo agendamento." onChange={clearOnChange(onObservation)} rows={4} />
      </div>
    </div>
  );
}
