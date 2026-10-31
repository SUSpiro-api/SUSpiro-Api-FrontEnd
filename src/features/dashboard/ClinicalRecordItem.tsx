import { formatClinicalDate, recordStatusLabels, recordTypeLabels } from './clinicalRecordConfig';
import type { ClinicalRecord } from './types';

interface ClinicalRecordItemProps {
  record: ClinicalRecord;
}

export function ClinicalRecordItem({ record }: ClinicalRecordItemProps) {
  return (
    <li className="appointment">
      <div className="appointment__info">
        <strong>{record.title}</strong>
        <span>{recordTypeLabels[record.type]} · {formatClinicalDate(record.date)}{record.time ? ` · ${record.time}` : ''}</span>
        {record.observation && <small>{record.observation}</small>}
      </div>
      <span className={`appointment__status appointment__status--${record.status}`}>{recordStatusLabels[record.status]}</span>
    </li>
  );
}
