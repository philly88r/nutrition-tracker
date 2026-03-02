import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Button component
export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
    outline: 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-primary',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
    link: 'text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary focus:ring-0'
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-base px-6 py-3'
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Disabled class
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Combine all classes
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
  
  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    
    const Icon = icon;
    return <Icon className={`h-5 w-5 ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`} />;
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// Card component
export const Card = ({ 
  children, 
  className = '', 
  title = null, 
  subtitle = null, 
  action = null, 
  padding = true,
  ...props
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${padding ? 'p-4 md:p-6' : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div>
              {action}
            </div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};

// Badge component
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '',
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    protein: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
    carbs: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    fat: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    fiber: 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-200'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };
  
  // Combine all classes
  const classes = `inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Alert component
export const Alert = ({ 
  title = null, 
  children, 
  variant = 'info', 
  dismissible = false,
  onDismiss = () => {},
  className = '',
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    info: 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-200',
    success: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-200',
    danger: 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-200',
  };
  
  // Combine all classes
  const classes = `p-4 rounded-md border-l-4 ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} role="alert" {...props}>
      <div className="flex">
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        
        {dismissible && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none"
            onClick={onDismiss}
            aria-label="Close"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  title = 'No data found', 
  description = 'There is no data to display.', 
  action = null,
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`} {...props}>
      {icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {description}
      </p>
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

// Progress bar component
export const ProgressBar = ({ 
  value = 0, 
  total = 100, 
  variant = 'primary',
  size = 'md',
  showLabel = false, 
  className = '',
  ...props
}) => {
  // Calculate percentage
  const percentage = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    danger: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    protein: 'bg-macros-protein',
    carbs: 'bg-macros-carbs',
    fat: 'bg-macros-fat',
    fiber: 'bg-macros-fiber'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };
  
  return (
    <div className={className} {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-medium">
          <span>{value} / {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
        <div 
          className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Divider component
export const Divider = ({ 
  label = null, 
  orientation = 'horizontal',
  className = '',
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`h-full border-l border-gray-200 dark:border-gray-700 ${className}`} {...props} />
    );
  }
  
  if (label) {
    return (
      <div className={`relative flex items-center ${className}`} {...props}>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        <span className="flex-shrink px-3 text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      </div>
    );
  }
  
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 ${className}`} {...props} />
  );
};
