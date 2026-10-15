import { useEffect, useRef, type ReactNode } from 'react';

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="panel-heading"><h2 id="modal-title">{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button></div>
    {children}
  </dialog>;
}

export function FormMessage({ pending, error }: { pending: boolean; error: Error | null }) {
  return <>{pending && <p role="status">Saving to the database…</p>}{error && <p className="error" role="alert">{error.message}</p>}</>;
}
