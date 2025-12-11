import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
      <p className="text-sm font-light tracking-widest opacity-80">LOADING ENVIRONMENT</p>
    </div>
  );
};