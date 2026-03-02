import React from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Form group wrapper for form elements
export const FormGroup = ({
  label,
  htmlFor,
  error,
  helpText,
  required = false,
  className = '',
  children
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error ? (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      ) : null}
    </div>
  );
};

// Text input component
export const Input = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helpText,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Determine input type for password field
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Generate input classes
  const getInputClasses = () => {
    let classes = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ';
    
    if (error) {
      classes += 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 ';
    } else {
      classes += 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600 ';
    }
    
    if (disabled) {
      classes += 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 ';
    } else {
      classes += 'bg-white dark:bg-gray-800 dark:text-white ';
    }
    
    return `${classes} ${inputClassName}`;
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={getInputClasses()}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
        
        {type === 'search' && value && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={() => onChange({ target: { name, value: '' } })}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </FormGroup>
  );
};

// Textarea component
export const Textarea = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helpText,
  className = '',
  textareaClassName = '',
  ...props
}) => {
  // Generate textarea classes
  const getTextareaClasses = () => {
    let classes = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ';
    
    if (error) {
      classes += 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 ';
    } else {
      classes += 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600 ';
    }
    
    if (disabled) {
      classes += 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 ';
    } else {
      classes += 'bg-white dark:bg-gray-800 dark:text-white ';
    }
    
    return `${classes} ${textareaClassName}`;
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={getTextareaClasses()}
        {...props}
      />
    </FormGroup>
  );
};

// Select component
export const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  selectClassName = '',
  ...props
}) => {
  // Generate select classes
  const getSelectClasses = () => {
    let classes = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ';
    
    if (error) {
      classes += 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 ';
    } else {
      classes += 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600 ';
    }
    
    if (disabled) {
      classes += 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 ';
    } else {
      classes += 'bg-white dark:bg-gray-800 dark:text-white ';
    }
    
    return `${classes} ${selectClassName}`;
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={getSelectClasses()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormGroup>
  );
};

// Checkbox component
export const Checkbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  error,
  helpText,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />
      </div>
      
      <div className="ml-3 text-sm">
        {label && (
          <label
            htmlFor={id}
            className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}
          >
            {label}
          </label>
        )}
        
        {error ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : helpText ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
        ) : null}
      </div>
    </div>
  );
};

// Radio component
export const Radio = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  error,
  helpText,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 border-gray-300 text-primary focus:ring-primary ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />
      </div>
      
      <div className="ml-3 text-sm">
        {label && (
          <label
            htmlFor={id}
            className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}
          >
            {label}
          </label>
        )}
        
        {error ? (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : helpText ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
        ) : null}
      </div>
    </div>
  );
};

// Radio Group component
export const RadioGroup = ({
  id,
  name,
  label,
  options = [],
  value,
  onChange,
  error,
  helpText,
  required = false,
  inline = false,
  className = '',
  ...props
}) => {
  return (
    <FormGroup
      label={label}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <div className={inline ? 'flex space-x-6' : 'space-y-2'}>
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${id || name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            label={option.label}
            disabled={option.disabled}
            {...props}
          />
        ))}
      </div>
    </FormGroup>
  );
};

// Range Slider component
export const RangeSlider = ({
  id,
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  // Handle slider change
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    onChange({
      target: {
        name,
        value: newValue
      }
    });
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <div className="flex items-center">
        <input
          id={id}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...props}
        />
        
        {showValue && (
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[40px] text-center">
            {value}
          </span>
        )}
      </div>
    </FormGroup>
  );
};

// Date picker component
export const DatePicker = ({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  inputClassName = '',
  ...props
}) => {
  // Generate input classes
  const getInputClasses = () => {
    let classes = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ';
    
    if (error) {
      classes += 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 ';
    } else {
      classes += 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600 ';
    }
    
    if (disabled) {
      classes += 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 ';
    } else {
      classes += 'bg-white dark:bg-gray-800 dark:text-white ';
    }
    
    return `${classes} ${inputClassName}`;
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className={getInputClasses()}
        {...props}
      />
    </FormGroup>
  );
};

// Number input with increment/decrement buttons
export const NumberInput = ({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  inputClassName = '',
  ...props
}) => {
  // Handle increment
  const handleIncrement = () => {
    if (max !== undefined && value >= max) return;
    onChange({
      target: {
        name,
        value: Number(value) + Number(step)
      }
    });
  };
  
  // Handle decrement
  const handleDecrement = () => {
    if (min !== undefined && value <= min) return;
    onChange({
      target: {
        name,
        value: Number(value) - Number(step)
      }
    });
  };
  
  // Generate input classes
  const getInputClasses = () => {
    let classes = 'block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-center ';
    
    if (error) {
      classes += 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 ';
    } else {
      classes += 'border-gray-300 focus:ring-primary focus:border-primary dark:border-gray-600 ';
    }
    
    if (disabled) {
      classes += 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 ';
    } else {
      classes += 'bg-white dark:bg-gray-800 dark:text-white ';
    }
    
    return `${classes} ${inputClassName}`;
  };
  
  return (
    <FormGroup
      label={label}
      htmlFor={id}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <div className="flex">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-l-md border border-gray-300 dark:border-gray-600"
        >
          -
        </button>
        
        <input
          id={id}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          className={getInputClasses()}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-r-md border border-gray-300 dark:border-gray-600"
        >
          +
        </button>
      </div>
    </FormGroup>
  );
};

export default {
  FormGroup,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  RangeSlider,
  DatePicker,
  NumberInput
};
