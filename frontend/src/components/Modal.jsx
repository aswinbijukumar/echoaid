import { useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  widthClass = 'w-96 max-w-full mx-4'
}) {
  const modalRef = useRef(null);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose && onClose();
    }
  };

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
        className={`${className} p-6 rounded-lg ${widthClass} max-h-[90vh] overflow-y-auto focus:outline-none`}
      >
        {title ? (
          <h3 id="modal-title" className="text-xl font-bold mb-4">{title}</h3>
        ) : null}
        {children}
        {footer ? (
          <div className="flex justify-end space-x-2 mt-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

