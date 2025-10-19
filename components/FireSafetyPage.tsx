import React from 'react';
import { FireSafetyIcon } from './icons/FireSafetyIcon';

const FireSafetyPage: React.FC = () => {
  const safetyTips = [
    {
      title: "Know Your Building's Evacuation Plan",
      description: "Familiarize yourself with all exit routes, stairwells, and emergency exits. Never use an elevator during a fire.",
    },
    {
      title: "Test Smoke Alarms Regularly",
      description: "Test your smoke alarms once a month and replace batteries at least once a year. A working smoke alarm is your first line of defense.",
    },
    {
      title: "Keep Fire Extinguishers Accessible",
      description: "Know the location of the nearest fire extinguisher and how to use it (P.A.S.S. method: Pull, Aim, Squeeze, Sweep).",
    },
    {
      title: "Practice Kitchen Safety",
      description: "Never leave cooking unattended. In case of a grease fire, smother the flames with a lid; never use water.",
    },
    {
      title: "If You Are Trapped",
      description: "Seal the cracks around your door with wet towels or tape. Call 911 and use the 'Distress Signal' feature in this app to report your location.",
    },
    {
      title: "Clear Clutter from Exits",
      description: "Keep hallways, stairwells, and doorways clear of obstructions to ensure a quick and safe escape route for everyone.",
    },
  ];

  return (
    <div className="w-full max-w-3xl bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      <div className="flex items-center gap-4">
        <div className="bg-fire-gold/20 p-3 rounded-full border-2 border-fire-gold/50">
          <FireSafetyIcon className="h-10 w-10 text-fire-gold" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-fire-gold font-display">Fire Safety Guidelines</h1>
          <p className="text-fire-text-secondary mt-1">Essential tips for apartment residents.</p>
        </div>
      </div>

      <div className="border-t border-fire-border pt-6 space-y-4">
        {safetyTips.map((tip, index) => (
          <div key={index} className="p-4 bg-fire-dark rounded-lg border border-fire-border">
            <h2 className="font-bold text-lg text-fire-gold">{tip.title}</h2>
            <p className="text-fire-text-secondary mt-1">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FireSafetyPage;