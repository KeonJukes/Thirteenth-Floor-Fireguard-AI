import React from 'react';

export const DistressSignalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v4"></path>
        <path d="M12 16h.01"></path>
        <path d="M21.5 12a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5z"></path>
        <path d="M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 1 0-15 0z"></path>
    </svg>
);
