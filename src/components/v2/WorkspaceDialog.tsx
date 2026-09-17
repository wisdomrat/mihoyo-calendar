import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function WorkspaceDialog({ title, onClose, children, className = '' }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('keydown', handleEscape);
    dialog.addEventListener('click', handleClickOutside);

    return () => {
      dialog.removeEventListener('keydown', handleEscape);
      dialog.removeEventListener('click', handleClickOutside);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={`v2-dialog ${className}`}>
      <div className="v2-dialog-heading">
        <h2>{title}</h2>
        <button className="v2-detail-close" onClick={onClose} aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="v2-dialog-content">{children}</div>
    </dialog>
  );
}
