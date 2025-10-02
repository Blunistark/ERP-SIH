import React from 'react';
import { clsx } from 'clsx';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  helperText,
  className,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;