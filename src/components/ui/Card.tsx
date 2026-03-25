import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  action, 
  hoverable = false,
  onClick 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${
        hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
