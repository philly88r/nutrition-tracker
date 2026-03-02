import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Elements';

// Modal component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  className = '',
  closeOnClickOutside = true,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  };
  
  // Stop propagation when clicking on the modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnClickOutside) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" {...props}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
          onClick={handleBackdropClick}
        />
        
        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        {/* Modal panel */}
        <div 
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full ${className}`}
          onClick={handleContentClick}
        >
          {/* Modal header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          )}
          
          {/* Modal body */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Modal footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation dialog component
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  cancelVariant = 'outline',
  icon = <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant={cancelVariant}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0 mr-3">
            {icon}
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>
    </Modal>
  );
};

// Toast notification component
export const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  // Type classes
  const typeClasses = {
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
  };
  
  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  };
  
  // Auto close toast after duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 p-4 max-w-xs w-full ${typeClasses[type]} rounded-lg shadow-lg ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-4 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Tooltip component
export const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Position classes
  const positionClasses = {
    'top': 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    'bottom': 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    'left': 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    'right': 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  // Arrow classes
  const arrowClasses = {
    'top': 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45',
    'bottom': 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45',
    'left': 'right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45',
    'right': 'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45'
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-40 ${positionClasses[position]} ${className}`}>
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 max-w-xs">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  Modal,
  ConfirmDialog,
  Toast,
  Tooltip
};
