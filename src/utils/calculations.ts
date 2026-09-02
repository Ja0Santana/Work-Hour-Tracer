import type { TimeEntry } from '../types/timeEntry';
import { calculateDuration, timeStringToMinutes } from './time';
import { isWithinWeek, isWithinMonth, toDateString } from './date';

export function calculateTotalMinutes(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => {
    return total + calculateDuration(entry.startTime, entry.endTime);
  }, 0);
}

export function getEntriesForDay(entries: TimeEntry[], dateStr: string): TimeEntry[] {
  return entries.filter((entry) => entry.date === dateStr);
}

export function getEntriesForWeek(entries: TimeEntry[], weekStart: Date): TimeEntry[] {
  return entries.filter((entry) => isWithinWeek(entry.date, weekStart));
}

export function getEntriesForMonth(entries: TimeEntry[], year: number, month: number): TimeEntry[] {
  return entries.filter((entry) => isWithinMonth(entry.date, year, month));
}

export function calculateWeeklyMinutes(entries: TimeEntry[], weekStart: Date): number {
  const weekEntries = getEntriesForWeek(entries, weekStart);
  return calculateTotalMinutes(weekEntries);
}

export function calculateMonthlyMinutes(entries: TimeEntry[], year: number, month: number): number {
  const monthEntries = getEntriesForMonth(entries, year, month);
  return calculateTotalMinutes(monthEntries);
}

export function calculateRemainingMinutes(workedMinutes: number, goalMinutes: number): number {
  return Math.max(goalMinutes - workedMinutes, 0);
}

export function calculateSurplusMinutes(workedMinutes: number, goalMinutes: number): number {
  return Math.max(workedMinutes - goalMinutes, 0);
}

export function calculateProgress(workedMinutes: number, goalMinutes: number): number {
  if (goalMinutes <= 0) return 0;
  return (workedMinutes / goalMinutes) * 100;
}

export function calculateEarnings(minutes: number, hourlyRate: number): number {
  return (minutes / 60) * hourlyRate;
}

export function calculateEntriesEarnings(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => {
    const duration = calculateDuration(entry.startTime, entry.endTime);
    return total + (duration / 60) * entry.hourlyRateAtCreation;
  }, 0);
}

export interface OverlapPair {
  entryA: TimeEntry;
  entryB: TimeEntry;
  overlapMinutes: number;
}

export function detectOverlaps(entries: TimeEntry[]): OverlapPair[] {
  const overlaps: OverlapPair[] = [];
  const dayGroups = new Map<string, TimeEntry[]>();

  for (const entry of entries) {
    const existing = dayGroups.get(entry.date) ?? [];
    existing.push(entry);
    dayGroups.set(entry.date, existing);
  }

  for (const dayEntries of dayGroups.values()) {
    for (let i = 0; i < dayEntries.length; i++) {
      for (let j = i + 1; j < dayEntries.length; j++) {
        const a = dayEntries[i];
        const b = dayEntries[j];

        const aStart = timeStringToMinutes(a.startTime);
        const aEnd = timeStringToMinutes(a.endTime) || timeStringToMinutes(a.endTime) + 1440;
        const bStart = timeStringToMinutes(b.startTime);
        const bEnd = timeStringToMinutes(b.endTime) || timeStringToMinutes(b.endTime) + 1440;

        const overlapStart = Math.max(aStart, bStart);
        const overlapEnd = Math.min(
          aEnd <= aStart ? aEnd + 1440 : aEnd,
          bEnd <= bStart ? bEnd + 1440 : bEnd,
        );

        if (overlapStart < overlapEnd) {
          overlaps.push({
            entryA: a,
            entryB: b,
            overlapMinutes: overlapEnd - overlapStart,
          });
        }
      }
    }
  }

  return overlaps;
}

export function getDailyTotals(
  entries: TimeEntry[],
  weekStart: Date,
): Map<string, number> {
  const totals = new Map<string, number>();
  const weekEntries = getEntriesForWeek(entries, weekStart);

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dateStr = toDateString(day);
    const dayEntries = weekEntries.filter((e) => e.date === dateStr);
    totals.set(dateStr, calculateTotalMinutes(dayEntries));
  }

  return totals;
}
