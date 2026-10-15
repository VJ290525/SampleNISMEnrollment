import { useState } from 'react';
import { useDashboard } from './api';
import type { Profile } from './types';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import { AddEnrollment, AddExam, AddProfile } from './components/CreateForms';
import ReviewProfile from './components/ReviewProfile';

const pages = { dashboard: 'Enrollment overview', enrollments: 'Enrollments', profiles: 'Profiles', exams: 'Examinations' };
export default function App() {
  const [page, setPage] = useState<keyof typeof pages>('dashboard');
  const [modal, setModal] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState('');
  const query = useDashboard();
  function saved(message: string) { setModal(''); setProfile(null); setNotice(message); }
  const close = () => setModal('');
  return <div className="layout"><aside><a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('dashboard'); }}><b>N</b><span>NISM<small>SYNC · OPERATIONS</small></span></a><p className="nav-label">WORKSPACE</p><nav aria-label="Main navigation">{Object.entries(pages).map(([key, name]) => <button key={key} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined} onClick={() => { setPage(key as keyof typeof pages); setNotice(''); }}>{name}</button>)}</nav><div className="sidebar-note">Enrollment management<small>Profiles · Exams · Sessions</small></div></aside>
    <div className="workspace"><header>Operations <span>/</span> {pages[page]}<span className="connection">SQL Server</span></header><main>
      <div className="page-heading"><div><p className="eyebrow">ENROLLMENT MANAGEMENT</p><h1>{pages[page]}</h1><p>Manage candidates, examinations, and enrollment in one place.</p></div><div className="toolbar"><button className="secondary" disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching ? 'Refreshing…' : 'Refresh'}</button></div></div>
      <div className="toolbar actions" aria-label="Create records"><button disabled={!query.data} onClick={() => { setNotice(''); setModal('enrollment'); }}>+ Add enrollment</button><button className="secondary" disabled={!query.data} onClick={() => { setNotice(''); setModal('profile'); }}>+ Add profile</button><button className="secondary" disabled={!query.data} onClick={() => { setNotice(''); setModal('exam'); }}>+ Add exam name</button></div>
      {notice && <p className="success" role="status">{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></p>}
      {query.isPending && <p className="panel" role="status">Loading enrollment data…</p>}
      {query.isError && <div className="panel error" role="alert"><h2>Could not refresh enrollment data</h2><p>{query.error.message}</p><button onClick={() => query.refetch()}>Retry</button>{query.data && <p>Previously loaded data below may be out of date.</p>}</div>}
      {query.data && <>{page === 'dashboard' ? <Dashboard data={query.data} /> : <Records page={page} data={query.data} onReview={setProfile} />}<p className="muted updated">Last refreshed: {new Date(query.dataUpdatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p></>}
      {modal === 'exam' && <AddExam onClose={close} onSaved={saved} />}{modal === 'profile' && <AddProfile onClose={close} onSaved={saved} />}{modal === 'enrollment' && query.data && <AddEnrollment data={query.data} onClose={close} onSaved={saved} />}
      {profile && <ReviewProfile profile={profile} onClose={() => setProfile(null)} onSaved={saved} />}
      <footer>NISM Sync <span>Enrollment operations</span></footer>
    </main></div>
  </div>;
}
