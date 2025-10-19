import React, { useState } from 'react';
import { ResidentProfile } from '../types';
import { BuildingIcon } from './icons/BuildingIcon';
import { UserIcon } from './icons/UserIcon';
import { StairsIcon } from './icons/StairsIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SignUpPageProps {
  onSignUp: (profile: ResidentProfile) => void;
}

const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
  return value;
};

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const [profile, setProfile] = useState<ResidentProfile>({
    name: '',
    aptNumber: '',
    floor: '',
    phone: '',
    tenants: '',
    photo: undefined,
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [errors, setErrors] = useState<Partial<ResidentProfile>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setProfile(prev => ({ ...prev, phone: formattedValue }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, photo: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<ResidentProfile> = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.aptNumber.trim()) newErrors.aptNumber = 'Apartment number is required';
    if (!profile.floor.trim()) newErrors.floor = 'Floor is required';
    if (!/^\d+$/.test(profile.floor)) newErrors.floor = 'Floor must be a number';
    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!profile.tenants.trim()) newErrors.tenants = 'Number of tenants is required';
     if (!/^\d+$/.test(profile.tenants) || parseInt(profile.tenants) <= 0) newErrors.tenants = 'Must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSignUp(profile);
    }
  };

  return (
    <div className="w-full max-w-md bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fire-gold font-display">Building Access Protocol</h1>
        <p className="text-fire-text-secondary mt-2">Enter your resident details to register.</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
          <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-fire-dark flex items-center justify-center border-2 border-dashed border-fire-border hover:border-fire-gold transition-colors relative group">
                  {profile.photo ? (
                      <img src={profile.photo} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
                  ) : (
                      <UserIcon className="h-10 w-10 text-fire-text-secondary" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="h-8 w-8 text-white" />
                  </div>
              </div>
          </label>
          <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          {profile.photo && (
              <button type="button" onClick={handleRemovePhoto} className="text-sm text-fire-red hover:brightness-125 flex items-center gap-1">
                <TrashIcon className="h-4 w-4" /> Remove
              </button>
          )}
          <p className="text-xs text-fire-text-secondary">Optional profile photo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField name="name" label="Full Name" value={profile.name} onChange={handleChange} error={errors.name} Icon={UserIcon} placeholder="John Doe" required />
        <div className="flex space-x-4">
          <div className="w-1/2">
            <InputField name="aptNumber" label="Apartment Number" value={profile.aptNumber} onChange={handleChange} error={errors.aptNumber} Icon={BuildingIcon} placeholder="e.g., 4B" required />
          </div>
          <div className="w-1/2">
            <InputField name="floor" label="Floor" type="number" value={profile.floor} onChange={handleChange} error={errors.floor} Icon={StairsIcon} placeholder="e.g., 4" required />
          </div>
        </div>
        <InputField name="phone" label="Mobile Phone" type="tel" value={profile.phone} onChange={handleChange} onBlur={handlePhoneBlur} error={errors.phone} Icon={PhoneIcon} placeholder="(555) 123-4567" required />
        <InputField name="tenants" label="Number of Tenants" type="number" value={profile.tenants} onChange={handleChange} error={errors.tenants} Icon={UsersIcon} placeholder="e.g., 2" required />

        <button type="submit" className="w-full bg-fire-gold text-fire-dark font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fire-gold transition-transform transform hover:scale-105">
          Submit
        </button>
      </form>
    </div>
  );
};

interface InputFieldProps {
  name: keyof Omit<ResidentProfile, 'photo' | 'emergencyContactName' | 'emergencyContactPhone'>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  Icon: React.FC<{ className?: string }>;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, onBlur, error, Icon, type = 'text', placeholder, required }) => (
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
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-fire-red' : 'border-fire-border'} bg-fire-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-fire-red' : 'focus:ring-fire-gold'} transition text-fire-text-primary placeholder:text-fire-border`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-fire-red">{error}</p>}
  </div>
);


export default SignUpPage;