export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  current?: boolean;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  period: string;
  details?: string;
}

export interface Certification {
  category: string;
  name: string;
}
