import type { DashboardData, Profile } from '../types';

type Props = { page: string; data: DashboardData; onReview: (profile: Profile) => void };
export default function Records({ page, data, onReview }: Props) {
  const records = page === 'profiles' ? data.profiles : page === 'exams' ? data.exams : data.enrollments;
  return <section className="panel"><div className="panel-heading"><h2>{page === 'profiles' ? 'Candidate profiles' : page === 'exams' ? 'Examination catalogue' : 'Enrollment register'}</h2><span className="badge">{records.length} records</span></div>
    {!records.length ? <p className="empty">No {page} yet. Use the Add button above to create the first record.</p> : <div className="table-wrap"><table>
      {page === 'profiles' ? <><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Centre</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.profiles.map(p => <tr key={p.id}><td>{p.fullName}<small className="reference">{p.reference}</small></td><td>{p.email}</td><td>{p.phone}</td><td>{p.centre}</td><td><span className="badge">{p.status}</span>{p.reviewReason && <small>{p.reviewReason}</small>}</td><td>{p.status === 'Pending' ? <button className="secondary" onClick={() => onReview(p)}>Review</button> : 'Reviewed'}</td></tr>)}</tbody></> :
        page === 'exams' ? <><thead><tr><th>Code</th><th>Exam name</th><th>Description</th></tr></thead><tbody>{data.exams.map(e => <tr key={e.id}><td><span className="badge">{e.code}</span></td><td>{e.name}</td><td>{e.description || '—'}</td></tr>)}</tbody></> :
          <><thead><tr><th>Reference</th><th>Candidate</th><th>Exam</th><th>Centre</th><th>Session</th><th>Status</th><th>Created (IST)</th></tr></thead><tbody>{data.enrollments.map(e => <tr key={e.id}><td className="reference">{e.reference}</td><td>{e.profileName}</td><td>{e.examName}</td><td>{e.centre}</td><td>{e.sessionId ? `#${e.sessionId}` : 'Unassigned'}</td><td><span className="badge">{e.status}</span></td><td>{new Date(e.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>)}</tbody></>}
    </table></div>}
  </section>;
}
