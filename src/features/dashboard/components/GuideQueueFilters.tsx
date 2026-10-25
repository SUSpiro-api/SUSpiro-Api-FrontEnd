// Filtros combinados para localizar e priorizar guias rapidamente.

import { MaterialIcon } from '../../../components/icons';
import type { GuidePriorityFilter, GuideSortOrder, GuideTypeFilter } from '../hooks/useGuideQueue';

interface GuideQueueFiltersProps {
  search: string;
  priority: GuidePriorityFilter;
  type: GuideTypeFilter;
  sortOrder: GuideSortOrder;
  visibleCount: number;
  totalGuides: number;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: GuidePriorityFilter) => void;
  onTypeChange: (value: GuideTypeFilter) => void;
  onSortOrderChange: (value: GuideSortOrder) => void;
  onClear: () => void;
}

function resultsSummary(visibleCount: number, totalGuides: number, hasFilters: boolean): string {
  if (hasFilters) {
    return `Exibindo ${visibleCount} de ${totalGuides} ${totalGuides === 1 ? 'guia' : 'guias'}.`;
  }
  return `${totalGuides} ${totalGuides === 1 ? 'guia aguardando' : 'guias aguardando'} agendamento.`;
}

export function GuideQueueFilters({
  search, priority, type, sortOrder, visibleCount, totalGuides,
  onSearchChange, onPriorityChange, onTypeChange, onSortOrderChange, onClear,
}: GuideQueueFiltersProps) {
  const hasFilters = search.trim().length > 0 || priority !== 'todas' || type !== 'todas' || sortOrder !== 'prioridade';

  return (
    <div className="guide-queue-filters">
      <div className="ui-field guide-queue-filters__search">
        <label className="ui-field__label" htmlFor="guide-search">Pesquisar guias</label>
        <div className="ui-field__control">
          <span className="ui-field__icon ui-field__icon--start" aria-hidden="true"><MaterialIcon name="search" size={20} /></span>
          <input
            id="guide-search"
            className="ui-field__input ui-field__input--with-start-icon"
            placeholder="Nome, CPF, número ou especialidade"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <div className="ui-field">
        <label className="ui-field__label" htmlFor="guide-type">Tipo de guia</label>
        <div className="ui-field__control ui-field__control--select">
          <select id="guide-type" className="ui-field__input ui-field__select" value={type} onChange={(event) => onTypeChange(event.target.value as GuideTypeFilter)}>
            <option value="todas">Todos os tipos</option>
            <option value="CONSULTA">Consulta</option>
            <option value="RETORNO">Retorno</option>
            <option value="EXAME">Exame</option>
            <option value="ENCAMINHAMENTO">Encaminhamento</option>
          </select>
        </div>
      </div>
      <div className="ui-field">
        <label className="ui-field__label" htmlFor="guide-priority">Prioridade</label>
        <div className="ui-field__control ui-field__control--select">
          <select id="guide-priority" className="ui-field__input ui-field__select" value={priority} onChange={(event) => onPriorityChange(event.target.value as GuidePriorityFilter)}>
            <option value="todas">Todas</option>
            <option value="URGENTE">Urgente</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
      </div>
      <div className="ui-field guide-queue-filters__sort">
        <label className="ui-field__label" htmlFor="guide-sort">Ordenar por</label>
        <div className="ui-field__control ui-field__control--select">
          <select id="guide-sort" className="ui-field__input ui-field__select" value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value as GuideSortOrder)}>
            <option value="prioridade">Prioridade primeiro</option>
            <option value="data-antiga">Data mais antiga</option>
            <option value="data-recente">Data mais recente</option>
          </select>
        </div>
      </div>
      <div className="guide-queue-filters__footer">
        <span aria-live="polite">{resultsSummary(visibleCount, totalGuides, hasFilters)}</span>
        <button type="button" className="guide-queue-clear" onClick={onClear} disabled={!hasFilters}>Limpar filtros</button>
      </div>
    </div>
  );
}
