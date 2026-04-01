import { Experience, Education, Certification } from './types';

export const EXPERIENCES: Experience[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Gospodar zdravja d.o.o.',
    location: 'Ljubljana, Slovenia (Remote)',
    period: 'AUG 2023 — OCT 2024',
    description: 'Worked on software infrastructure and industry-scale applications, focusing on robust system design and scalable backend solutions.',
  },
  {
    id: '2',
    title: 'Math and Physics Tutor',
    company: 'Freelance',
    location: 'Remote',
    period: 'JAN 2020 — OCT 2024',
    description: 'Provided advanced tutoring in mathematics and physics, simplifying complex theoretical concepts for students and fostering deep analytical thinking.',
  },
  {
    id: '3',
    title: 'Unity Teacher (Teens 13-18yo)',
    company: 'NEXT 4.0 d.o.o.',
    location: 'Ljubljana, Slovenia',
    period: 'MAR 2023 — FEB 2024',
    description: 'Taught game development and interactive systems using Unity, guiding students through the logic of real-time 3D environments.',
  },
  {
    id: '4',
    title: 'Data Engineer',
    company: 'Bragg Gaming',
    location: 'Ljubljana, Slovenia (On-site)',
    period: 'MAR 2023 — AUG 2023',
    description: 'Internship focused on data engineering pipelines, SQL optimization, and Python-based data processing for large-scale gaming systems.',
  },
];

export const EDUCATION: Education[] = [
  {
    id: '1',
    degree: 'M.Sc. Computer Science',
    school: 'Technische Universität Graz',
    location: 'Graz, Austria',
    period: 'JUL 2025 (EXPECTED)',
    details: 'Advanced studies in Computer Science, focusing on algorithmic depth and system architecture.',
  },
  {
    id: '2',
    degree: 'M.Sc. Computer Science',
    school: 'University of Ljubljana (UL FRI)',
    location: 'Ljubljana, Slovenia',
    period: 'OCT 2024 — PRESENT',
    details: 'Specializing in AI and Cybersecurity. Active member of Dragonsec SI and BEST Ljubljana.',
  },
  {
    id: '3',
    degree: "Bachelor's degree, Computer Programming",
    school: 'University of Ljubljana (UL FRI)',
    location: 'Ljubljana, Slovenia',
    period: '2020 — 2024',
    details: 'Comprehensive studies in computer programming, software engineering, and core computer science principles.',
  },
];

export const CERTIFICATIONS: Certification[] = [
  { category: 'Fullstack Development', name: 'Outbrain Fullstack Summer School 2023' },
];
