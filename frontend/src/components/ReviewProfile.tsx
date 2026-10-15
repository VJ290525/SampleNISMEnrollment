import { useState, type FormEvent } from 'react';
import { useReview } from '../api';
import type { Profile } from '../types';
import Modal, { FormMessage } from './Modal';

export default function ReviewProfile({ profile, onClose, onSaved }: { profile: Profile; onClose: () => void; onSaved: (message: string) => void }) {
  const [status, setStatus] = useState('Approved');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const mutation = useReview();
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    mutation.mutate({ profile, status, reason }, { onSuccess: () => onSaved(`Profile ${status.toLowerCase()}.`) });
  }
  return <Modal title={`Review ${profile.fullName}`} onClose={onClose}>
    <p>{profile.email} · {profile.centre}</p><p className="reference">{profile.reference}</p>
    <form onSubmit={submit}><fieldset disabled={mutation.isPending || confirm}>
      <label>Decision<select autoFocus value={status} onChange={e => setStatus(e.target.value)}><option>Approved</option><option>Rejected</option><option>Correction requested</option></select></label>
      <label>Reason {status === 'Approved' && <span className="muted">(optional)</span>}<textarea required={status !== 'Approved'} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} rows={3} /></label>
    </fieldset>
    {confirm && <p role="status">Confirm {status.toLowerCase()} for {profile.fullName}? This decision will be saved.</p>}
    <FormMessage pending={mutation.isPending} error={mutation.error} />
    <div className="form-actions"><button type="button" className="secondary" disabled={mutation.isPending} onClick={() => confirm ? setConfirm(false) : onClose()}>{confirm ? 'Back' : 'Cancel'}</button><button disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : confirm ? 'Confirm decision' : 'Review decision'}</button></div>
    </form>
  </Modal>;
}
