import { MaterialIcon } from '../../components/icons';
import { ClinicalRecordItem } from './ClinicalRecordItem';
import { ClinicalRecordTabs } from './ClinicalRecordTabs';
import { useClinicalRecordList } from './hooks/useClinicalRecordList';
import type { ClinicalRecord, Patient } from './types';

interface ClinicalRecordListProps {
  records: ClinicalRecord[];
  selectedPatient: Patient | null;
  onCreate: () => void;
}

export function ClinicalRecordList({ records, selectedPatient, onCreate }: ClinicalRecordListProps) {
  const history = useClinicalRecordList(records, selectedPatient);

  return (
    <section className="dashboard-card dashboard-records" aria-labelledby="records-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="records-title" className="dashboard-card__title">{history.title}</h2>
          <p className="dashboard-card__subtitle">{history.subtitle}</p>
        </div>
        <div className="dashboard-card__actions">
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={onCreate}>
            <MaterialIcon name="add" size={17} /> Novo registro
          </button>
        </div>
      </header>

      <ClinicalRecordTabs
        selectedTab={history.selectedTab}
        counts={history.counts}
        tabRefs={history.tabRefs}
        onSelect={history.setSelectedTab}
        onKeyDown={history.handleTabKeyDown}
      />

      <div id="clinical-records-panel" role="tabpanel" aria-labelledby={`clinical-record-tab-${history.selectedTab}`} tabIndex={0}>
        {history.visibleRecords.length > 0 ? (
          <ul className="appointment-list">
            {history.visibleRecords.map((record) => <ClinicalRecordItem key={record.id} record={record} />)}
          </ul>
        ) : <p className="dashboard-empty">Nenhum registro encontrado nesta categoria.</p>}
      </div>
    </section>
  );
}
