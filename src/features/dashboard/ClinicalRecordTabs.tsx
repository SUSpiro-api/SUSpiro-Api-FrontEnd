// Mostra as abas para filtrar o histórico por tipo de atendimento.

import type { KeyboardEvent } from 'react';
import { recordTabLabels, recordTabs, type RecordTab } from './clinicalRecordConfig';

interface ClinicalRecordTabsProps {
  selectedTab: RecordTab;
  counts: Record<RecordTab, number>;
  tabRefs: { current: Array<HTMLButtonElement | null> };
  onSelect: (tab: RecordTab) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

export function ClinicalRecordTabs({ selectedTab, counts, tabRefs, onSelect, onKeyDown }: ClinicalRecordTabsProps) {
  return (
    <div className="dashboard-tabs" role="tablist" aria-label="Filtrar registros">
      {recordTabs.map((tab, index) => (
        <button
          key={tab}
          id={`clinical-record-tab-${tab}`}
          aria-controls="clinical-records-panel"
          ref={(element) => { tabRefs.current[index] = element; }}
          type="button"
          role="tab"
          aria-selected={selectedTab === tab}
          tabIndex={selectedTab === tab ? 0 : -1}
          className={['dashboard-tab', selectedTab === tab && 'dashboard-tab--active'].filter(Boolean).join(' ')}
          onClick={() => onSelect(tab)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {recordTabLabels[tab]}
          <span className="dashboard-tab__count" aria-hidden="true">{counts[tab]}</span>
        </button>
      ))}
    </div>
  );
}
