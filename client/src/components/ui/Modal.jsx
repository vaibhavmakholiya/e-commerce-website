import React, { useEffect, useCallback } from 'react';
import { cn } from '../../utils/helpers';
import Button from './Button';

/**
 * Modal — Accessible dialog with keyboard trap & backdrop.
 *
 * Props:
 *   isOpen:     boolean
 *   onClose:    () => void
 *   title:      string
 *   size:       'sm' | 'md' | 'lg'
 *   footer:     ReactNode — custom footer content
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const maxWidthMap = { sm: '420px', md: '520px', lg: '720px' };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn('modal-dialog', className)}
        style={{ maxWidth: maxWidthMap[size] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {title}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * ConfirmModal — Pre-built confirmation dialog.
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

export default Modal;
