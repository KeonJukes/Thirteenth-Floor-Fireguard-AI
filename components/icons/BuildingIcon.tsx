
import React from 'react';

export const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <line x1="8" y1="22" x2="8" y2="4"></line>
    <line x1="16" y1="22" x2="16" y2="4"></line>
    <line x1="4" y1="12" x2="20" y2="12"></line>
  </svg>
);
