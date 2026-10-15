import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddEnrollment, AddExam, AddProfile } from './CreateForms';
import type { DashboardData } from '../types';

function wrap(node: React.ReactNode) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{node}</QueryClientProvider>);
}
const data: DashboardData = { exams: [{ id: 7, code: 'NEW', name: 'New exam', description: '' }], profiles: [{ id: 5, reference: 'C-5', fullName: 'Test Candidate', email: 'test@example.com', phone: '9876543210', centre: 'Mumbai', status: 'Approved', reviewReason: '', createdAt: '', version: 'AAAA' }], sessions: [], enrollments: [] };
describe('Create forms', () => {
  it('submits an exam and reports success', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 7 }), { status: 201 }));
    const saved = vi.fn(); wrap(<AddExam onClose={vi.fn()} onSaved={saved} />);
    await userEvent.type(screen.getByLabelText('Exam code'), 'NEW');
    await userEvent.type(screen.getByLabelText('Exam name'), 'New exam');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(JSON.parse(fetch.mock.calls[0][1]!.body as string)).toEqual({ code: 'NEW', name: 'New exam', description: '' });
  });
  it('retains profile input and displays duplicate email errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ title: 'A profile with this email already exists.' }), { status: 409 }));
    const saved = vi.fn(); wrap(<AddProfile onClose={vi.fn()} onSaved={saved} />);
    await userEvent.type(screen.getByLabelText('Full name'), 'Candidate');
    await userEvent.type(screen.getByLabelText('Email address'), 'candidate@example.com');
    await userEvent.type(screen.getByLabelText('Phone number'), '9876543210');
    await userEvent.type(screen.getByLabelText('Preferred centre'), 'Mumbai');
    fireEvent.submit(screen.getByRole('button', { name: /^Save$/ }).closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
    expect(screen.getByLabelText('Email address')).toHaveValue('candidate@example.com');
    expect(saved).not.toHaveBeenCalled();
  });
  it('allows an approved candidate to enroll in a new exam without a session', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 201 }));
    const saved = vi.fn(); wrap(<AddEnrollment data={data} onClose={vi.fn()} onSaved={saved} />);
    await userEvent.selectOptions(screen.getByLabelText('Candidate profile'), '5');
    await userEvent.selectOptions(screen.getByLabelText('Examination'), '7');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(JSON.parse(fetch.mock.calls[0][1]!.body as string)).toEqual({ profileId: 5, examId: 7, centre: 'Mumbai', sessionId: null });
  });
  it('blocks enrollment when no approved profile exists', () => {
    wrap(<AddEnrollment data={{ ...data, profiles: [] }} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('approve at least one');
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
  });
});
