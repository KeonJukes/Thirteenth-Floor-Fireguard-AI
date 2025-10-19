import React, { useState } from 'react';
import SignUpPage from './components/SignUpPage';
import DashboardLayout from './components/DashboardLayout';
import { ResidentProfile } from './types';

function App() {
  const [residentProfile, setResidentProfile] = useState<ResidentProfile | null>(null);

  const handleSignUp = (profile: ResidentProfile) => {
    setResidentProfile(profile);
  };

  const handleUpdateProfile = (updatedProfile: ResidentProfile) => {
    setResidentProfile(updatedProfile);
  };

  const handleLogout = () => {
    setResidentProfile(null);
  };

  if (residentProfile) {
    return (
      <DashboardLayout
        profile={residentProfile}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-fire-dark flex flex-col items-center justify-center p-4 font-sans">
      <SignUpPage onSignUp={handleSignUp} />
    </div>
  );
}

export default App;