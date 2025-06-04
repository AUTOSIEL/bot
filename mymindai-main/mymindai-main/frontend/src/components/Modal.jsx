import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  closeButton,
  overlayClose,
  width,
  height,
  animation,
  customStyles,
}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);

      const initialHeight = window.innerHeight;
      const handleResize = () => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const isKeyboardActive = viewportHeight < initialHeight * 0.7; // Порог 70%
        setIsKeyboardOpen(isKeyboardActive);
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
      }
      window.addEventListener('resize', handleResize);

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleResize);
        }
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && overlayClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`modal-overlay ${animation ? `modal-${animation}` : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`modal-content ${isKeyboardOpen ? 'modal-content-keyboard-open' : ''} ${
          animation ? `modal-${animation}-content` : ''
        }`}
        style={{
          width: width || 'auto',
          height: height || 'auto',
          ...customStyles?.content
        }}
      >
        {(title || closeButton) && (
          <div className="modal-header" style={customStyles?.header}>
            {title && <h2 className="modal-title" style={customStyles?.title}>{title}</h2>}
            {closeButton && (
              <button 
                className="modal-close" 
                onClick={onClose}
                aria-label="Close modal"
                style={customStyles?.closeButton}
              >
                &times;
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body" style={customStyles?.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
  closeButton: PropTypes.bool,
  overlayClose: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  animation: PropTypes.oneOf(['fade', 'slide', 'zoom', 'none']),
  customStyles: PropTypes.shape({
    content: PropTypes.object,
    header: PropTypes.object,
    title: PropTypes.object,
    body: PropTypes.object,
    closeButton: PropTypes.object,
  }),
};

Modal.defaultProps = {
  closeButton: true,
  overlayClose: true,
  animation: 'fade',
};

export default Modal;