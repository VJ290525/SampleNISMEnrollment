import { useState, type FormEvent } from 'react';
import type { DashboardData } from '../types';
import { dailyCounts, filterEnrollments, istDate, type Filters } from '../dashboard';

export default function Dashboard({ data }: { data: DashboardData }) {
  const today = istDate(new Date());
  const initial = { from: `${today.slice(0, 7)}-01`, to: today, exam: '', centre: '', status: '' };
  const [draft, setDraft] = useState<Filters>(initial);
  const [filters, setFilters] = useState<Filters>(initial);
  const [error, setError] = useState('');
  function apply(event: FormEvent) {
    event.preventDefault();
    const days = (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000;
    if (!Number.isFinite(days) || days < 0 || days >= 366) { setError('Select a valid date range of up to 366 days.'); return; }
    setError(''); setFilters(draft);
  }
  const rows = filterEnrollments(data.enrollments, filters);
  const buckets = dailyCounts(rows, filters.from, filters.to);
  const max = Math.max(1, ...buckets.map(b => b.count));
  const groups = data.exams.map(e => ({ ...e, count: rows.filter(r => r.examId === e.id).length })).filter(e => e.count).sort((a, b) => b.count - a.count);
  const sessions = data.sessions.filter(s => new Date(s.startsAt) > new Date() && (!filters.exam || s.examId === Number(filters.exam)) && (!filters.centre || s.centre === filters.centre));
  return <>
    <form className="filters panel" onSubmit={apply}>
      <label>Enrollment from (IST)<input required type="date" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} /></label>
      <label>Enrollment to (IST)<input required type="date" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} /></label>
      <label>Examination<select value={draft.exam} onChange={e => setDraft({ ...draft, exam: e.target.value })}><option value="">All exams</option>{data.exams.map(e => <option key={e.id} value={e.id}>{e.code}</option>)}</select></label>
      <label>Centre<select value={draft.centre} onChange={e => setDraft({ ...draft, centre: e.target.value })}><option value="">All centres</option>{[...new Set([...data.enrollments, ...data.sessions].map(e => e.centre))].map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">All statuses</option><option>Confirmed</option><option>Pending</option><option>Cancelled</option></select></label>
      <button>Apply</button><button type="button" className="secondary" onClick={() => { setDraft(initial); setFilters(initial); setError(''); }}>Reset</button>
    </form>{error && <p role="alert" className="error">{error}</p>}
    <section className="metrics" aria-label="Dashboard summary">
      {[['Total enrollments', rows.length, 'In the selected enrollment period'], ['Confirmed', rows.filter(r => r.status === 'Confirmed').length, 'Successfully enrolled candidates'], ['Pending profiles', data.profiles.filter(p => p.status === 'Pending').length, 'All pending profiles · independent dates'], ['Available seats', sessions.reduce((sum, s) => sum + s.availableSeats, 0), 'Future sessions · independent of enrollment dates']].map(([label, value, note]) => <article className="panel" key={label}><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}
    </section>
    <div className="charts"><section className="panel"><h2>Enrollment trends</h2><p className="muted">Daily enrollment volume · IST</p>
      {rows.length ? <div className="trend" aria-hidden="true">{buckets.map(b => <div key={b.day} title={`${b.day}: ${b.count}`}><span style={{ height: `${b.count / max * 135}px` }} /><small>{buckets.length <= 31 ? b.day.slice(8) : ''}</small></div>)}</div> : <p className="empty">No enrollments match this period. Add your first enrollment to get started.</p>}
      <details><summary>View daily data</summary><div className="table-wrap"><table><thead><tr><th>Date (IST)</th><th>Enrollments</th></tr></thead><tbody>{buckets.map(b => <tr key={b.day}><td>{b.day}</td><td>{b.count}</td></tr>)}</tbody></table></div></details>
    </section><section className="panel"><h2>Exam distribution</h2><p className="muted">Enrollments by examination</p>
      {groups.length ? groups.map(g => <div className="distribution" key={g.id}><div><span>{g.code} · {g.name}</span><b>{g.count} · {(g.count / rows.length * 100).toFixed(1)}%</b></div><progress max={rows.length} value={g.count} aria-label={`${g.name}: ${g.count} enrollments`} /></div>) : <p className="empty">No exam distribution yet.</p>}
      {!!groups.length && <small>Rounded percentages may not total 100%.</small>}
    </section></div>
    <section className="panel"><h2>Upcoming exam sessions</h2><p className="muted">Seats are checked again when an enrollment is saved.</p><div className="session-grid">
      {sessions.length ? sessions.map(s => <article className="session" key={s.id}><span className="badge">{!s.bookingOpen ? 'Booking closed' : s.availableSeats ? 'Booking open' : 'Full'}</span><h3>{s.examName}</h3><p>{s.centre} · {new Date(s.startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p><strong>{s.availableSeats} seats available</strong><p className="muted">Capacity {s.capacity} · Booked {s.bookedSeats} · Holds {s.heldSeats}</p></article>) : <p className="empty">No upcoming sessions.</p>}
    </div></section>
  </>;
}
