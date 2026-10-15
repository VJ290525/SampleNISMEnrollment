import type { Enrollment } from './types';

export function istDate(value: string | Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)!.value).join('-');
}
export interface Filters { from: string; to: string; exam: string; centre: string; status: string }
export function filterEnrollments(rows: Enrollment[], filters: Filters) {
  return rows.filter(e => istDate(e.createdAt) >= filters.from && istDate(e.createdAt) <= filters.to &&
    (!filters.exam || e.examId === Number(filters.exam)) && (!filters.centre || e.centre === filters.centre) && (!filters.status || e.status === filters.status));
}
export function dailyCounts(rows: Enrollment[], from: string, to: string) {
  const counts = new Map<string, number>();
  for (const row of rows) { const day = istDate(row.createdAt); counts.set(day, (counts.get(day) ?? 0) + 1); }
  const result: { day: string; count: number }[] = [];
  for (let date = new Date(`${from}T00:00:00Z`); date.toISOString().slice(0, 10) <= to && result.length < 366; date.setUTCDate(date.getUTCDate() + 1)) {
    const day = date.toISOString().slice(0, 10); result.push({ day, count: counts.get(day) ?? 0 });
  }
  return result;
}
