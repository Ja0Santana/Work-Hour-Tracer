export const ACTIVITY_CATEGORIES = [
  'analysis',
  'development',
  'bug-fix',
  'testing',
  'planning',
  'documentation',
  'ui-ux',
  'meeting',
  'devops',
  'study',
  'maintenance',
  'other',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  analysis: 'Análise',
  development: 'Desenvolvimento',
  'bug-fix': 'Correção de Bug',
  testing: 'Testes',
  planning: 'Planejamento',
  documentation: 'Documentação',
  'ui-ux': 'UI/UX',
  meeting: 'Reunião',
  devops: 'DevOps / Infra',
  study: 'Estudo',
  maintenance: 'Manutenção',
  other: 'Outro',
};

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  analysis: '#818cf8',
  development: '#34d399',
  'bug-fix': '#f87171',
  testing: '#fbbf24',
  planning: '#60a5fa',
  documentation: '#a78bfa',
  'ui-ux': '#f472b6',
  meeting: '#fb923c',
  devops: '#2dd4bf',
  study: '#c084fc',
  maintenance: '#94a3b8',
  other: '#9ca3af',
};

export interface TimeEntry {
  id: string;
  date: string;
  project: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  description: string;
  notes?: string;
  hourlyRateAtCreation: number;
  createdAt: string;
  updatedAt?: string;
}
