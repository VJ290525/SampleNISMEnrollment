import { useState, type FormEvent } from 'react';
import { useCreate } from '../api';
import type { CreateEnrollment, CreateExam, CreateProfile, DashboardData } from '../types';
import Modal, { FormMessage } from './Modal';

type Props = { onClose: () => void; onSaved: (message: string) => void };
function Actions({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  return <div className="form-actions"><button type="button" className="secondary" disabled={pending} onClick={onClose}>Cancel</button><button disabled={pending} type="submit">{pending ? 'Saving…' : 'Save'}</button></div>;
}

export function AddExam({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<CreateExam>({ code: '', name: '', description: '' });
  const mutation = useCreate<CreateExam>('exams');
  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(form, { onSuccess: () => onSaved('Exam added successfully.') });
  }
  return <Modal title="Add exam name" onClose={onClose}><p>Create an examination to use in new enrollments.</p><form onSubmit={submit}>
    <fieldset disabled={mutation.isPending}>
      <label>Exam code<input autoFocus required maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9 ._\-]*" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. XIX-A" /></label>
      <label>Exam name<input required maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>Description <span className="muted">(optional)</span><textarea maxLength={1000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    </fieldset>
    <FormMessage pending={mutation.isPending} error={mutation.error} /><Actions pending={mutation.isPending} onClose={onClose} />
  </form></Modal>;
}

export function AddProfile({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<CreateProfile>({ fullName: '', email: '', phone: '', centre: '' });
  const mutation = useCreate<CreateProfile>('profiles');
  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(form, { onSuccess: () => onSaved('Profile added. Approve it in Profiles before enrolling.') });
  }
  return <Modal title="Add profile" onClose={onClose}><p>New profiles enter the Pending review queue.</p><form onSubmit={submit}>
    <fieldset disabled={mutation.isPending}>
      <label>Full name<input autoFocus required maxLength={120} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} autoComplete="name" /></label>
      <label>Email address<input required type="email" maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
      <label>Phone number<input required type="tel" pattern="\+?[0-9 \(\)\-]{7,20}" maxLength={20} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" /></label>
      <label>Preferred centre<input required maxLength={100} value={form.centre} onChange={e => setForm({ ...form, centre: e.target.value })} placeholder="e.g. Mumbai" /></label>
    </fieldset>
    <FormMessage pending={mutation.isPending} error={mutation.error} /><Actions pending={mutation.isPending} onClose={onClose} />
  </form></Modal>;
}

export function AddEnrollment({ data, onClose, onSaved }: Props & { data: DashboardData }) {
  const [form, setForm] = useState<CreateEnrollment>({ profileId: 0, examId: 0, sessionId: null, centre: '' });
  const mutation = useCreate<CreateEnrollment>('enrollments');
  const profiles = data.profiles.filter(p => p.status === 'Approved');
  const sessions = data.sessions.filter(s => s.examId === form.examId && s.bookingOpen && s.availableSeats > 0);
  const session = sessions.find(s => s.id === form.sessionId);
  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ ...form, centre: session?.centre ?? form.centre }, { onSuccess: () => onSaved('Enrollment added successfully.') });
  }
  return <Modal title="Add enrollment" onClose={onClose}>
    {!profiles.length || !data.exams.length ? <p role="status">Add an exam and approve at least one candidate profile before creating an enrollment.</p> :
      <form onSubmit={submit}><p>Select an approved profile and an exam. A session can be assigned now or left unassigned.</p>
        <fieldset disabled={mutation.isPending}>
          <label>Candidate profile<select autoFocus required value={form.profileId || ''} onChange={e => { const p = profiles.find(p => p.id === Number(e.target.value)); setForm({ ...form, profileId: Number(e.target.value), centre: p?.centre ?? '' }); }}>
            <option value="">Select a profile</option>{profiles.map(p => <option value={p.id} key={p.id}>{p.fullName} · {p.email}</option>)}
          </select></label>
          <label>Examination<select required value={form.examId || ''} onChange={e => setForm({ ...form, examId: Number(e.target.value), sessionId: null })}>
            <option value="">Select an exam</option>{data.exams.map(e => <option key={e.id} value={e.id}>{e.code} · {e.name}</option>)}
          </select></label>
          <label>Session <span className="muted">(optional)</span><select value={form.sessionId ?? ''} onChange={e => setForm({ ...form, sessionId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Assign later</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.centre} · {new Date(s.startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST · {s.availableSeats} seats</option>)}
          </select></label>
          <label>Centre<input required maxLength={100} readOnly={!!session} value={session?.centre ?? form.centre} onChange={e => setForm({ ...form, centre: e.target.value })} /></label>
        </fieldset>
        <FormMessage pending={mutation.isPending} error={mutation.error} /><Actions pending={mutation.isPending} onClose={onClose} />
      </form>}
  </Modal>;
}
