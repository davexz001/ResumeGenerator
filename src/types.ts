export interface User {
  id: string;
  email: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  data: ResumeData; // Supabase returns this as a parsed JSON object when using jsonb
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  templateId?: string;
  customTemplateHtml?: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin: string;
  };
  education: Array<{
    id: string;
    school: string;
    degree: string;
    graduationDate: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  skills: Array<{ id: string; name: string }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export const emptyResumeData: ResumeData = {
  templateId: 'minimalist',
  personalInfo: { name: '', email: '', phone: '', location: '', summary: '', linkedin: '' },
  education: [],
  experience: [],
  skills: [],
  projects: []
};
