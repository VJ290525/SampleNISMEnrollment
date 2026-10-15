import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEnrollment, CreateExam, CreateProfile, DashboardData, Profile } from './types';

export async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    const errors = problem?.errors ? Object.values(problem.errors).flat().join(' ') : '';
    throw new Error(errors || problem?.title || `Request failed (${response.status}). Please retry.`);
  }
  return response.json() as Promise<T>;
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: async (): Promise<DashboardData> => {
    const [exams, profiles, enrollments, sessions] = await Promise.all([
      request<DashboardData['exams']>('exams'), request<DashboardData['profiles']>('profiles'),
      request<DashboardData['enrollments']>('enrollments'), request<DashboardData['sessions']>('sessions'),
    ]);
    return { exams, profiles, enrollments, sessions };
  } });
}

export function useCreate<T>(path: 'exams' | 'profiles' | 'enrollments') {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: T) => request(path, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['dashboard'] }) });
}
export function useReview() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ profile, status, reason }: { profile: Profile; status: string; reason: string }) =>
    request(`profiles/${profile.id}/review`, { status, reason, version: profile.version }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['dashboard'] }) });
}
export type CreateInput = CreateExam | CreateProfile | CreateEnrollment;
