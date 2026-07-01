import type { TutorialSubtask, TutorialSubtaskAction } from '../../../types';
import type { OfficialLink } from '../links';

type SubtaskInput = Omit<TutorialSubtask, 'id'> & { id?: string };

export function sub(id: string, data: Omit<SubtaskInput, 'id'>): TutorialSubtask {
  return {
    id,
    difficulty: 'Средняя',
    estimatedTime: '15–30 минут',
    ...data
  };
}

export function action(afterStep: number, label: string, url: string): TutorialSubtaskAction {
  return { afterStep, label, url };
}

export function mergeSubtaskLinks(...groups: (OfficialLink[] | undefined)[]): OfficialLink[] {
  const seen = new Set<string>();
  const out: OfficialLink[] = [];
  for (const group of groups) {
    if (!group) continue;
    for (const link of group) {
      if (seen.has(link.url)) continue;
      seen.add(link.url);
      out.push(link);
    }
  }
  return out;
}
