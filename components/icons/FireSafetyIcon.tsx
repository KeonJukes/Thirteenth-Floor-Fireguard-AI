import React from 'react';

export const FireSafetyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M14.5 9c0 2.5-2 4.5-4.5 4.5S5.5 11.5 5.5 9a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5z"></path>
        <path d="M12 11v4"></path>
    </svg>
);
