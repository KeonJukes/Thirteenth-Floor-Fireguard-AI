import React, { useState, useEffect } from 'react';
import { ResidentProfile } from '../types';
import { BuildingIcon } from './icons/BuildingIcon';
import { UserIcon } from './icons/UserIcon';
import { StairsIcon } from './icons/StairsIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { UsersIcon } from './icons/UsersIcon';
import { EditIcon } from './icons/EditIcon';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EmergencyContactIcon } from './icons/EmergencyContactIcon';

interface ProfilePageProps {
  profile: ResidentProfile;
  onUpdateProfile: (profile: ResidentProfile) => void;
}

const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
  return value;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<ResidentProfile>(profile);
  const [errors, setErrors] = useState<Partial<ResidentProfile>>({});

  useEffect(() => {
    setEditableProfile(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableProfile(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setEditableProfile(prev => ({ ...prev, photo: undefined }));
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    setEditableProfile(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<ResidentProfile> = {};
    if (!editableProfile.name.trim()) newErrors.name = 'Name is required';
    if (!editableProfile.aptNumber.trim()) newErrors.aptNumber = 'Apartment number is required';
    if (!editableProfile.floor.trim()) newErrors.floor = 'Floor is required';
    if (!/^\d+$/.test(editableProfile.floor)) newErrors.floor = 'Floor must be a number';
    if (!editableProfile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(editableProfile.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!editableProfile.tenants.trim()) newErrors.tenants = 'Number of tenants is required';
    if (!/^\d+$/.test(editableProfile.tenants) || parseInt(editableProfile.tenants) <= 0) newErrors.tenants = 'Must be a positive number';

    // Optional validation for emergency contact phone
    if (editableProfile.emergencyContactPhone && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(editableProfile.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validate()) {
      onUpdateProfile(editableProfile);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="w-full max-w-lg bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-fire-gold font-display">Resident Profile</h1>
          <p className="text-fire-text-secondary mt-2">Manage your information here.</p>
        </div>
        <div className="w-20 h-20 rounded-full bg-fire-dark flex items-center justify-center border-2 border-fire-border flex-shrink-0">
          {profile.photo ? (
            <img src={profile.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="h-10 w-10 text-fire-text-secondary" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="flex flex-col items-center space-y-2 pt-2 pb-4">
                <label htmlFor="profile-photo-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-fire-dark flex items-center justify-center border-2 border-dashed border-fire-border hover:border-fire-gold transition-colors relative group">
                        {editableProfile.photo ? (
                            <img src={editableProfile.photo} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <UserIcon className="h-12 w-12 text-fire-text-secondary" />
                        )}
                         <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CameraIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </label>
                <input id="profile-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {editableProfile.photo && (
                    <button type="button" onClick={handleRemovePhoto} className="text-sm text-fire-red hover:brightness-125 flex items-center gap-1">
                        <TrashIcon className="h-4 w-4" /> Remove Photo
                    </button>
                )}
            </div>
            <EditField name="name" label="Full Name" value={editableProfile.name} onChange={handleChange} error={errors.name} Icon={UserIcon} required />
            <div className="flex space-x-4">
              <div className="w-1/2">
                <EditField name="aptNumber" label="Apartment #" value={editableProfile.aptNumber} onChange={handleChange} error={errors.aptNumber} Icon={BuildingIcon} required />
              </div>
              <div className="w-1/2">
                <EditField name="floor" label="Floor" type="number" value={editableProfile.floor} onChange={handleChange} error={errors.floor} Icon={StairsIcon} required />
              </div>
            </div>
            <EditField name="phone" label="Mobile Phone" type="tel" value={editableProfile.phone} onChange={handleChange} onBlur={handlePhoneBlur} error={errors.phone} Icon={PhoneIcon} required />
            <EditField name="tenants" label="# of Tenants" type="number" value={editableProfile.tenants} onChange={handleChange} error={errors.tenants} Icon={UsersIcon} required />
            
            <div className="border-t border-fire-border pt-4 mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-fire-text-primary">Emergency Contact (Optional)</h3>
                <EditField name="emergencyContactName" label="Contact Full Name" value={editableProfile.emergencyContactName || ''} onChange={handleChange} Icon={EmergencyContactIcon} />
                <EditField name="emergencyContactPhone" label="Contact Phone" type="tel" value={editableProfile.emergencyContactPhone || ''} onChange={handleChange} onBlur={handlePhoneBlur} error={errors.emergencyContactPhone} Icon={PhoneIcon} />
            </div>
          </>
        ) : (
          <>
            <InfoField label="Full Name" value={profile.name} Icon={UserIcon} />
            <InfoField label="Apartment" value={`${profile.aptNumber} (Floor ${profile.floor})`} Icon={BuildingIcon} />
            <InfoField label="Mobile Phone" value={profile.phone} Icon={PhoneIcon} />
            <InfoField label="Number of Tenants" value={profile.tenants} Icon={UsersIcon} />
            {profile.emergencyContactName && (
                <div className="border-t border-fire-border pt-4 mt-4">
                     <InfoField 
                        label="Emergency Contact" 
                        value={`${profile.emergencyContactName} - ${profile.emergencyContactPhone}`} 
                        Icon={EmergencyContactIcon} 
                     />
                </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-fire-border pt-6">
        {isEditing ? (
          <div className="flex justify-end space-x-3">
            <button onClick={handleCancel} className="bg-fire-border text-fire-text-primary font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition">Cancel</button>
            <button onClick={handleSave} className="bg-fire-gold text-fire-dark font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition">Save Changes</button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-fire-gold/20 text-fire-gold font-bold py-2 px-4 rounded-lg hover:bg-fire-gold/30 transition">
              <EditIcon className="h-5 w-5" />
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoFieldProps {
  label: string;
  value: string;
  Icon: React.FC<{ className?: string }>;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, Icon }) => (
  <div className="flex items-center p-3 bg-fire-dark rounded-lg">
    <Icon className="h-6 w-6 text-fire-text-secondary mr-4" />
    <div>
      <p className="text-sm font-medium text-fire-text-secondary">{label}</p>
      <p className="text-lg font-semibold text-fire-text-primary">{value}</p>
    </div>
  </div>
);

interface EditFieldProps {
  name: keyof Omit<ResidentProfile, 'photo'>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  Icon: React.FC<{ className?: string }>;
  type?: string;
  required?: boolean;
}

const EditField: React.FC<EditFieldProps> = ({ name, label, value, onChange, onBlur, error, Icon, type = 'text', required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-fire-text-secondary mb-1">
      {label}
      {required && <span className="text-fire-red ml-1">*</span>}
    </label>
    <div className="relative">
       <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-fire-text-secondary" />
      </span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-fire-red' : 'border-fire-border'} bg-fire-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-fire-red' : 'focus:ring-fire-gold'} transition text-fire-text-primary placeholder:text-fire-border`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-fire-red">{error}</p>}
  </div>
);

export default ProfilePage;