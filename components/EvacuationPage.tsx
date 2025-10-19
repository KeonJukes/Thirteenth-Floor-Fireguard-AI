import React, { useState } from 'react';
import { FireIcon } from './icons/FireIcon';
import { EvacuationIcon } from './icons/EvacuationIcon';
import EvacuationRoute3D from './EvacuationRoute3D';

interface EvacuationPageProps {
  fireDetected: boolean;
  fireFloor: number | null;
  residentFloor: number;
}

const EvacuationPage: React.FC<EvacuationPageProps> = ({ fireDetected, fireFloor, residentFloor }) => {
  const [show3DRoute, setShow3DRoute] = useState(false);

  if (show3DRoute && fireFloor) {
    return <EvacuationRoute3D 
              fireFloor={fireFloor} 
              residentFloor={residentFloor} 
              onClose={() => setShow3DRoute(false)} 
           />;
  }

  return (
    <div className="w-full max-w-2xl bg-fire-card rounded-xl shadow-2xl p-8 text-center animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      {fireDetected && fireFloor ? (
        <>
          <div className="mx-auto bg-fire-red/20 rounded-full h-20 w-20 flex items-center justify-center border-4 border-fire-red/50">
            <FireIcon className="h-10 w-10 text-fire-red animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-fire-red font-display mt-6">EMERGENCY ALERT</h1>
          <p className="text-2xl font-bold text-fire-text-primary mt-4">
            Fire detected on Floor <span className="text-fire-red">{fireFloor}</span>
          </p>
          <p className="text-fire-text-secondary mt-2">
            Please evacuate the building immediately. Follow all safety procedures.
          </p>
          <button
            onClick={() => setShow3DRoute(true)}
            className="mt-8 bg-fire-red text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-fire-red/50 transition-transform transform hover:scale-105"
          >
            Evacuation Directions
          </button>
        </>
      ) : (
        <>
          <div className="mx-auto bg-fire-safe/20 rounded-full h-20 w-20 flex items-center justify-center border-4 border-fire-safe/50">
             <EvacuationIcon className="h-10 w-10 text-fire-safe" />
          </div>
          <h1 className="text-3xl font-bold text-fire-gold font-display mt-6">Evacuation Status</h1>
          <p className="text-xl text-fire-safe font-semibold mt-4 bg-fire-safe/10 p-4 rounded-lg">
            All Clear
          </p>
          <p className="text-fire-text-secondary mt-4">
            No fire or smoke has been detected in the building.
          </p>
        </>
      )}
    </div>
  );
};

export default EvacuationPage;