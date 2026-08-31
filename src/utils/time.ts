export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [hoursStr, minutesStr] = time.split(':');
  return {
    hours: parseInt(hoursStr, 10),
    minutes: parseInt(minutesStr, 10),
  };
}

export function timeStringToMinutes(time: string): number {
  const { hours, minutes } = parseTimeString(time);
  return hours * 60 + minutes;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const startMinutes = timeStringToMinutes(startTime);
  let endMinutes = timeStringToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 0) {
    return '0h 00min';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}min`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function isValidTimeString(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}
