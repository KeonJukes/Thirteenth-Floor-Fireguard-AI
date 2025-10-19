import React from 'react';

export const FireTruckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 40 20" 
        fill="none"
    >
        <style>
            {`
                @keyframes siren-pulse {
                    0%, 100% { fill: #E53E3E; }
                    50% { fill: #00BCD4; }
                }
            `}
        </style>
        {/* Main Body */}
        <rect x="0" y="2.5" width="35" height="15" rx="2" fill="#E0A34A" />
        {/* Cabin */}
        <rect x="25" y="0" width="15" height="20" rx="2" fill="#383838" />
        {/* Windshield */}
        <rect x="27" y="2" width="11" height="16" rx="1" fill="#A0AEC0" opacity="0.7" />
        {/* Siren */}
        <circle cx="32.5" cy="10" r="2" fill="#E53E3E" style={{ animation: 'siren-pulse 1s infinite' }} />
    </svg>
);