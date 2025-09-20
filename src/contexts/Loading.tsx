// src/components/Loading.tsx
import React from 'react';

interface LoadingProps {
  message?: string; // Optional loading message
  className?: string; // Optional custom styling
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center mt-10 space-y-4 ${className}`}>
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

      {/* Loading text */}
      <p className="text-gray-600 font-semibold text-lg">{message}</p>
    </div>
  );
};

export default Loading;
