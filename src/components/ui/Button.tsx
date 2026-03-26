import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-earth-500 text-white hover:bg-earth-600 hover:shadow-md focus:ring-earth-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
