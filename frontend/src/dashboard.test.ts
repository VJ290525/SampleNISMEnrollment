import { describe, expect, it } from 'vitest';
import { dailyCounts, filterEnrollments, istDate } from './dashboard';
import type { Enrollment } from './types';

const rows: Enrollment[] = [
  { id: 1, reference: 'E-1', profileId: 1, profileName: 'One', examId: 1, examName: 'Exam', centre: 'Mumbai', status: 'Confirmed', sessionId: null, createdAt: '2026-10-14T18:30:00Z' },
  { id: 2, reference: 'E-2', profileId: 2, profileName: 'Two', examId: 2, examName: 'Other', centre: 'Pune', status: 'Confirmed', sessionId: null, createdAt: '2026-10-15T18:30:00Z' },
];
describe('Enrollment summaries', () => {
  it('uses IST midnight boundaries rather than browser timezone', () => {
    expect(istDate('2026-10-14T18:29:59Z')).toBe('2026-10-14');
    expect(istDate('2026-10-14T18:30:00Z')).toBe('2026-10-15');
    expect(filterEnrollments(rows, { from: '2026-10-15', to: '2026-10-15', exam: '', centre: '', status: '' }).map(x => x.id)).toEqual([1]);
  });
  it('combines exam, centre and status filters', () => {
    const filter = { from: '2026-10-01', to: '2026-10-31', exam: '1', centre: 'Mumbai', status: 'Confirmed' };
    expect(filterEnrollments(rows, filter)).toHaveLength(1);
    expect(filterEnrollments(rows, { ...filter, centre: 'Pune' })).toHaveLength(0);
  });
  it('includes zero-count days and reconciles the trend', () => {
    const days = dailyCounts(rows, '2026-10-14', '2026-10-17');
    expect(days.map(d => d.count)).toEqual([0, 1, 1, 0]);
    expect(days.reduce((sum, d) => sum + d.count, 0)).toBe(rows.length);
  });
});
