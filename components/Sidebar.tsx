import React from 'react';
import { ResidentProfile } from '../types';
import { UserIcon } from './icons/UserIcon';
import { FireIcon } from './icons/FireIcon';
import { EvacuationIcon } from './icons/EvacuationIcon';
import { DistressSignalIcon } from './icons/DistressSignalIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { FireSafetyIcon } from './icons/FireSafetyIcon';
import { MapIcon } from './icons/MapIcon';


interface SidebarProps {
  profile: ResidentProfile;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  fireDetected: boolean;
  isVoiceCommandsEnabled: boolean;
  toggleVoiceCommands: () => void;
  isListening: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ profile, onLogout, activeView, setActiveView, fireDetected, isVoiceCommandsEnabled, toggleVoiceCommands, isListening }) => {
  const navItems = [
    { id: 'profile', label: 'My Profile', Icon: UserIcon },
    { id: 'fire-monitoring', label: 'Fire Monitoring', Icon: FireIcon },
    { id: 'fire-safety', label: 'Fire Safety', Icon: FireSafetyIcon },
    { id: 'evacuation', label: 'Evacuation Plan', Icon: EvacuationIcon },
    { id: 'track-responders', label: 'Track Responders', Icon: MapIcon },
    { id: 'distress-signal', label: 'Distress Signal', Icon: DistressSignalIcon },
  ];

  return (
    <aside className="w-64 bg-fire-card shadow-md flex flex-col">
       <div className="p-6 text-center border-b border-fire-border">
        <h1 className="text-3xl font-display font-bold text-fire-gold tracking-wider">13th Floor</h1>
        <p className="text-xs text-fire-text-secondary font-sans tracking-widest uppercase">Fireguard.ai</p>
      </div>
      <div className="p-6 text-center border-b border-fire-border">
        <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-fire-dark flex items-center justify-center border-2 border-fire-border">
          {profile.photo ? (
            <img src={profile.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="h-12 w-12 text-fire-text-secondary" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-fire-text-primary">{profile.name}</h2>
        <p className="text-sm text-fire-text-secondary">Apt {profile.aptNumber}, Floor {profile.floor}</p>
      </div>

      <nav className="flex-1 mt-6 space-y-2 px-4">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            Icon={item.Icon}
            label={item.label}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
            isAlert={item.id === 'evacuation' && fireDetected}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-fire-border mt-auto">
         <div className="flex items-center justify-between p-2 bg-fire-dark rounded-lg border border-fire-border mb-4">
            <div className="flex items-center gap-2">
                <MicrophoneIcon className={`h-5 w-5 transition-colors ${isListening && isVoiceCommandsEnabled ? 'text-green-500 animate-pulse' : 'text-fire-text-secondary'}`} />
                <span className={`text-xs font-semibold transition-colors ${isVoiceCommandsEnabled ? 'text-fire-text-primary' : 'text-fire-text-secondary'}`}>
                    Voice Commands
                </span>
            </div>
            <button
                onClick={toggleVoiceCommands}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fire-gold ${isVoiceCommandsEnabled ? 'bg-fire-gold' : 'bg-fire-border'}`}
                aria-label="Toggle Voice Commands"
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVoiceCommandsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 text-sm font-medium text-fire-text-secondary rounded-lg hover:bg-fire-dark transition-colors"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  Icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isAlert?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ Icon, label, isActive, onClick, isAlert }) => {
  const baseClasses = 'w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors';
  const activeClasses = 'bg-fire-gold/20 text-fire-gold';
  const inactiveClasses = 'text-fire-text-secondary hover:bg-fire-dark hover:text-fire-gold';
  const alertClasses = 'bg-fire-red/20 text-fire-red animate-pulse';

  const getClasses = () => {
    if (isAlert) return `${baseClasses} ${alertClasses}`;
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <button onClick={onClick} className={getClasses()}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
};

export default Sidebar;