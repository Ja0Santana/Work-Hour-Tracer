export interface AppSettings {
  weeklyGoalMinutes: number;
  hourlyRate: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  weeklyGoalMinutes: 2400,
  hourlyRate: 35,
};
