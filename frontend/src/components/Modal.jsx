import { useEffect, useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  widthClass = 'w-96 max-w-full mx-4',
  fullscreen = false
}) {
  const modalRef = useRef(null);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose && onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg flex items-center justify-center z-50"
      onMouseDown={handleBackdrop}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`${className} ${fullscreen ? 'p-4' : 'p-6'} rounded-lg ${fullscreen ? 'w-[98vw] max-w-[1600px] h-[96vh]' : widthClass} ${fullscreen ? 'overflow-hidden' : 'max-h-[90vh] overflow-y-auto'} focus:outline-none relative`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
        {title ? (
          <h3 id="modal-title" className="text-xl font-bold mb-4">{title}</h3>
        ) : null}
        <div className={`${fullscreen ? 'h-[calc(96vh-48px)] overflow-y-auto pr-2' : ''}`}>
          {children}
        </div>
        {footer ? (
          <div className="flex justify-end space-x-2 mt-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

