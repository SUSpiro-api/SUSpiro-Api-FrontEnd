// Mostra o carregamento ou as guias que passaram pelos filtros.

import type { Guide } from '../../guides';
import { GuideQueueEmpty } from './GuideQueueEmpty';
import { GuideQueueError } from './GuideQueueError';
import { GuideQueueItem } from './GuideQueueItem';
import { GuideQueueLoading } from './GuideQueueLoading';

interface GuideQueueResultsProps {
  loading: boolean;
  error: string;
  totalGuides: number;
  guides: Guide[];
  onRetry: () => void;
  onSchedule: (guide: Guide) => void;
}

export function GuideQueueResults({
  loading,
  error,
  totalGuides,
  guides,
  onRetry,
  onSchedule,
}: GuideQueueResultsProps) {
  if (loading) return <GuideQueueLoading />;
  if (error) return <GuideQueueError message={error} onRetry={onRetry} />;
  if (guides.length === 0) return <GuideQueueEmpty hasGuides={totalGuides > 0} />;

  return (
    <ul className="guide-queue-list">
      {guides.map((guide) => (
        <GuideQueueItem key={guide.id} guide={guide} onSchedule={onSchedule} />
      ))}
    </ul>
  );
}
