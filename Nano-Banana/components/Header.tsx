import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm p-4 border-b border-green-500/20 flex items-center space-x-4">
      <img src="darjyo25px.png" alt="Darjyo Logo" className="h-10" />
      <h1 className="text-2xl font-bold font-orbitron text-green-400 tracking-widest">
        AI <span className="text-yellow-400">4</span> Design
      </h1>
    </header>
  );
};