import React from 'react';
import { motion } from 'motion/react';
import { EXPERIENCES, EDUCATION, CERTIFICATIONS } from '../constants';
import { Linkedin, Github, GraduationCap, Verified } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ExperiencePage() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-8">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7"
        >
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-on-surface mb-6 leading-[0.9]">
            MODERN <br /> <span className="text-primary italic">SOFTWARE</span> ENGINEER.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
            Specializing in AI, Cybersecurity, and Algorithmics. I focus on the bigger picture—understanding the deep limitations and vast abilities of systems to build truly impactful technology.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative w-64 h-64 rounded-full overflow-hidden border border-outline-variant/30">
              <img 
                src="/uploads/hero-portrait.jpeg" 
                alt="Nik Cadez Professional Portrait"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
        {/* Education Card */}
        <motion.div 
          whileHover={{ backgroundColor: 'rgba(53, 53, 53, 0.4)' }}
          className="md:col-span-2 md:row-span-2 glass-panel refractive-edge rounded-3xl p-10 flex flex-col justify-between group transition-all duration-500"
        >
          <div>
            <div className="flex justify-between items-start mb-12">
              <span className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">Academic Background</span>
              <GraduationCap className="text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-12">
              {EDUCATION.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-3xl font-bold tracking-tight text-on-surface mb-2">{edu.degree}</h3>
                  <p className="text-on-surface-variant text-lg">{edu.school}</p>
                  <div className="mt-4">
                    <span className="px-3 py-1 bg-surface-container-lowest text-[10px] font-black tracking-widest text-primary border border-outline-variant/20 rounded-full uppercase">
                      {edu.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-outline-variant/10">
            <p className="text-sm text-on-surface-variant italic">
              {EDUCATION[0].details}
            </p>
          </div>
        </motion.div>

        {/* Certifications Card */}
        <div className="md:col-span-2 md:row-span-1 glass-panel refractive-edge rounded-3xl p-10 flex flex-col justify-between border-l-4 border-secondary/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tighter">Certifications</h2>
            <Verified className="text-secondary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CERTIFICATIONS.map((cert, i) => (
              <div key={i} className="space-y-1">
                <div className="text-[10px] font-black tracking-widest text-secondary/70 uppercase">{cert.category}</div>
                <div className="text-on-surface font-medium">{cert.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Cards */}
        <motion.a 
          href="https://www.linkedin.com/in/nik-%C4%8Dade%C5%BE-2068861b4/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-1 md:row-span-1 glass-panel refractive-edge rounded-3xl p-8 flex flex-col justify-center items-center gap-4 group transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-container-highest/50 flex items-center justify-center border border-outline-variant/30 group-hover:border-primary/50 transition-all">
            <Linkedin className="w-8 h-8 text-primary" />
          </div>
          <span className="text-[11px] font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">LinkedIn</span>
        </motion.a>

        <motion.a 
          href="https://github.com/RootRooster"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-1 md:row-span-1 glass-panel refractive-edge rounded-3xl p-8 flex flex-col justify-center items-center gap-4 group transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-container-highest/50 flex items-center justify-center border border-outline-variant/30 group-hover:border-secondary/50 transition-all">
            <Github className="w-8 h-8 text-secondary" />
          </div>
          <span className="text-[11px] font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">GitHub</span>
        </motion.a>
      </section>

      {/* Experience Timeline */}
      <section className="mt-32">
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-4xl font-black tracking-tight uppercase">Professional Journey</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-outline-variant/50 to-transparent" />
        </div>
        <div className="space-y-8">
          {EXPERIENCES.map((exp, i) => (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-12 group"
            >
              <div className={cn(
                "absolute left-0 top-2 w-4 h-4 rounded-full ring-4 transition-all",
                exp.current ? "bg-primary ring-primary/10 scale-125" : "bg-outline-variant ring-outline-variant/10 group-hover:bg-secondary group-hover:ring-secondary/10"
              )} />
              {i !== EXPERIENCES.length - 1 && (
                <div className="absolute left-[7px] top-6 w-0.5 h-full bg-outline-variant/20" />
              )}
              <div className="glass-panel refractive-edge rounded-2xl p-8 hover:bg-surface-container/60 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight text-on-surface">{exp.title}</h4>
                    <p className="text-primary font-medium">{exp.company} — {exp.location}</p>
                  </div>
                  <span className="px-4 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                    {exp.period}
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed max-w-3xl">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
