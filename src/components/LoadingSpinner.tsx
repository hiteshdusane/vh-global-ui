import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div role="status" aria-label="Loading" className={`animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 ${sizeClasses[size]} ${className}`}><span className="sr-only">Loading</span></div>
  );
};

export default LoadingSpinner;
