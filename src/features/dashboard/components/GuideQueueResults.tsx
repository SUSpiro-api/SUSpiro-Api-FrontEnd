import type { Guide } from '../../guides';
import { GuideQueueEmpty } from './GuideQueueEmpty';
import { GuideQueueError } from './GuideQueueError';
import { GuideQueueItem } from './GuideQueueItem';
import { GuideQueueLoading } from './GuideQueueLoading';

interface GuideQueueResultsProps {
  canSchedule?: boolean;
  loading: boolean;
  error: string;
  totalGuides: number;
  guides: Guide[];
  onRetry: () => void;
  onSchedule: (guide: Guide) => void;
}

export function GuideQueueResults({
  canSchedule = true,
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
        <GuideQueueItem key={guide.id} guide={guide} onSchedule={onSchedule} canSchedule={canSchedule} />
      ))}
    </ul>
  );
}
