/**
 * ConfirmDialog Component
 * Accessible modal dialog to replace window.confirm().
 * Implements ARIA dialog pattern with focus trapping.
 */

import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus into dialog when opened; return it when closed
  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button first (safer default for destructive actions)
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus inside dialog and handle Escape key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }

    if (e.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-neutral-200 focus:outline-none"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking content
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-2xl ${isDestructive ? 'text-amber-500' : 'text-primary-600'}`}
            aria-hidden="true"
          >
            {isDestructive ? '⚠️' : '❓'}
          </span>
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-neutral-900"
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-message"
          className="text-neutral-600 mb-6 text-sm leading-relaxed"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isDestructive
                ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
