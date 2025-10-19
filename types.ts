export interface ResidentProfile {
  name: string;
  aptNumber: string;
  floor: string;
  phone: string;
  tenants: string;
  photo?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface TranscriptEntry {
  speaker: 'user' | 'dispatcher';
  text: string;
}
