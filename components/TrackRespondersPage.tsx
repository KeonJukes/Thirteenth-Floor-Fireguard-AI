import React, { useState, useEffect } from 'react';
import { MapIcon } from './icons/MapIcon';
import { FireTruckIcon } from './icons/FireTruckIcon';

const TrackRespondersPage: React.FC = () => {
  const [eta, setEta] = useState(7); // Initial ETA in minutes
  const [progress, setProgress] = useState(0); // Progress percentage

  useEffect(() => {
    // This effect runs once on mount to set up timers.
    const etaTimer = setInterval(() => {
      // Decrease ETA every 60 seconds, but don't go below 1.
      setEta(prev => (prev > 1 ? prev - 1 : 1));
    }, 60 * 1000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        // Stop the progress at 100%.
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        // Increment progress to simulate movement.
        return prev + 2; 
      });
    }, 1000);

    // Cleanup function to clear intervals when the component unmounts.
    return () => {
      clearInterval(etaTimer);
      clearInterval(progressTimer);
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  return (
    <div className="w-full max-w-4xl bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      <div className="flex items-center gap-4">
        <div className="bg-fire-gold/20 p-3 rounded-full border-2 border-fire-gold/50">
          <MapIcon className="h-10 w-10 text-fire-gold" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-fire-gold font-display">Track Emergency Responders</h1>
          <p className="text-fire-text-secondary mt-1">Live status of dispatched fire department units.</p>
        </div>
      </div>

      <div className="border-t border-fire-border pt-6 space-y-6">
        <div className="p-4 bg-fire-dark rounded-lg border border-fire-border text-center">
          <p className="text-lg font-semibold text-fire-text-secondary">Estimated Time of Arrival (ETA)</p>
          <p className="text-5xl font-extrabold text-fire-gold animate-pulse">{eta} min</p>
          <p className="text-sm text-fire-text-secondary mt-1">Unit E-72 from Station 5 is en route.</p>
        </div>
        
        <div className="relative h-64 bg-fire-dark rounded-lg overflow-hidden border-4 border-fire-border">
          {/* Mock Map Background using CSS gradients for a grid */}
           <div 
              className="absolute inset-0"
              style={{
                  backgroundSize: '40px 40px',
                  backgroundImage: `
                      linear-gradient(to right, #4A5568 1px, transparent 1px),
                      linear-gradient(to bottom, #4A5568 1px, transparent 1px)
                  `
              }}
          ></div>
          <div className="absolute inset-0 bg-black/20"></div>

          <div className="absolute top-4 left-4 p-2 bg-fire-card/80 rounded-lg text-xs font-bold shadow-lg">
            FIRE STATION 5
          </div>
          <div className="absolute bottom-4 right-4 p-2 bg-fire-red text-white rounded-lg text-xs font-bold shadow-lg">
            YOUR LOCATION
          </div>

          {/* Progress Bar and Truck */}
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-2 bg-fire-border rounded-full">
             <div 
                className="h-full bg-fire-gold rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
             ></div>
          </div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
            style={{ left: `calc(${progress}% - 20px)` }}
          >
            <FireTruckIcon className="w-20 h-10 -translate-y-4" />
          </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-fire-text-primary mb-2">Status Updates</h3>
            <div className="space-y-2 text-sm">
                <p className="p-2 bg-fire-safe/10 rounded-lg border-l-4 border-fire-safe">
                    <span className="font-bold">[Now]</span> Unit E-72 is en route. Proceeding with lights and sirens.
                </p>
                <p className="p-2 bg-fire-dark rounded-lg border-l-4 border-fire-border">
                    <span className="font-bold">[-1 min]</span> Unit E-72 dispatched from Station 5.
                </p>
                 <p className="p-2 bg-fire-dark rounded-lg border-l-4 border-fire-border">
                    <span className="font-bold">[-2 min]</span> 911 call received and verified.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRespondersPage;