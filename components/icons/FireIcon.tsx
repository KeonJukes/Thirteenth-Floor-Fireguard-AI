import React from 'react';

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l.94 1.88C14.22 7.51 16.5 10 16.5 12.5c0 2.5-2 4.5-4.5 4.5S7.5 15 7.5 12.5c0-2.5 2.28-4.99 3.56-7.93L12 2.69zM12 17v4m-3-3h6"></path>
        <path d="M19.5 12.5c0 4.14-3.36 7.5-7.5 7.5s-7.5-3.36-7.5-7.5c0-2.33 1.05-4.43 2.75-5.85"></path>
    </svg>
);
