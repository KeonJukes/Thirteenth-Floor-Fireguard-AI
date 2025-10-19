import React, { useState, useEffect, useRef } from 'react';
import { ResidentProfile } from '../types';
import Sidebar from './Sidebar';
import ProfilePage from './ProfilePage';
import FireMonitoringPage from './FireMonitoringPage';
import EvacuationPage from './EvacuationPage';
import DistressSignalPage from './DistressSignalPage';
import FireSafetyPage from './FireSafetyPage';
import TrackRespondersPage from './TrackRespondersPage';

interface DashboardLayoutProps {
  profile: ResidentProfile;
  onUpdateProfile: (profile: ResidentProfile) => void;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ profile, onUpdateProfile, onLogout }) => {
  const [activeView, setActiveView] = useState('profile');
  const [fireFloor, setFireFloor] = useState<number | null>(null);
  const [isVoiceCommandsEnabled, setIsVoiceCommandsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const stopListeningRef = useRef(false);

  const toggleVoiceCommands = () => {
    setIsVoiceCommandsEnabled(prevState => !prevState);
  };
  
  useEffect(() => {
    if (!isVoiceCommandsEnabled) {
      if (recognitionRef.current) {
        stopListeningRef.current = true;
        recognitionRef.current.abort();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition is not supported by this browser.");
      setIsVoiceCommandsEnabled(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsListening(true);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // If we are intentionally stopping, don't restart.
      if (stopListeningRef.current) {
        console.log("Speech recognition stopped intentionally.");
        return;
      }
      
      // Attempt to restart after a delay to make it continuous.
      setTimeout(() => {
        // Double-check the flag before restarting, in case it changed during the timeout.
        if (recognitionRef.current && !stopListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            // This can happen if the state is invalid.
            console.error("Error attempting to restart speech recognition:", err);
          }
        }
      }, 1000); // Using a slightly longer delay for more stability.
    };

    recognition.onerror = (event: any) => {
       // 'aborted' is a common event when the session is closed manually.
      // 'no-speech' is also common if the user is silent.
      // We don't need to log these as critical errors.
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopListeningRef.current = true;
        setIsVoiceCommandsEnabled(false);
        console.warn("Disabling voice commands due to permission denial.");
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      
      if (transcript.includes('go to profile')) {
        setActiveView('profile');
      } else if (transcript.includes('go to fire monitoring')) {
        setActiveView('fire-monitoring');
      } else if (transcript.includes('go to fire safety')) {
        setActiveView('fire-safety');
      } else if (transcript.includes('go to evacuation')) {
        setActiveView('evacuation');
      } else if (transcript.includes('go to track responders')) {
        setActiveView('track-responders');
      } else if (transcript.includes('send distress signal') || transcript.includes('go to distress signal')) {
        setActiveView('distress-signal');
      }
    };

    try {
      stopListeningRef.current = false;
      recognition.start();
    } catch (e) {
      console.error("Could not start speech recognition:", e);
    }

    return () => {
      stopListeningRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [isVoiceCommandsEnabled]);

  const handleFireDetected = (floor: number | null) => {
    setFireFloor(floor);
    if (floor !== null) {
      setActiveView('evacuation');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfilePage profile={profile} onUpdateProfile={onUpdateProfile} />;
      case 'fire-monitoring':
        return <FireMonitoringPage onFireDetected={handleFireDetected} />;
      case 'fire-safety':
        return <FireSafetyPage />;
      case 'evacuation':
        return <EvacuationPage fireDetected={fireFloor !== null} fireFloor={fireFloor} residentFloor={parseInt(profile.floor, 10)} />;
      case 'distress-signal':
        return <DistressSignalPage profile={profile} />;
      case 'track-responders':
        return <TrackRespondersPage />;
      default:
        return <ProfilePage profile={profile} onUpdateProfile={onUpdateProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-fire-dark flex font-sans">
      <Sidebar 
        profile={profile} 
        onLogout={onLogout} 
        activeView={activeView}
        setActiveView={setActiveView}
        fireDetected={fireFloor !== null}
        isVoiceCommandsEnabled={isVoiceCommandsEnabled}
        toggleVoiceCommands={toggleVoiceCommands}
        isListening={isListening}
      />
      <main className="flex-1 p-8 flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;