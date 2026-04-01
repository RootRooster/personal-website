import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getProjects, type Project } from '../lib/api';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-24">
      {/* Header */}
      <div className="mb-24 space-y-4">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-bold tracking-[3px] uppercase text-xs"
        >
          Selected Works
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-on-surface"
        >
          ENGINEERING <br /> THE <span className="text-on-surface-variant/30">FUTURE.</span>
        </motion.h1>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative flex flex-col",
              project.featured ? "md:col-span-2" : "col-span-1"
            )}
          >
            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] glass-panel p-2">
              <div className="relative w-full h-full overflow-hidden rounded-[2rem]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div className="flex gap-3">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-on-primary transition-all">
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-8 space-y-4 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">{project.category}</span>
                  <h3 className="text-3xl font-black tracking-tight text-on-surface group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                </div>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all duration-500 -rotate-45 group-hover:rotate-0">
                    <ArrowUpRight size={24} />
                  </a>
                )}
              </div>

              <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full bg-surface-container-low text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-48 p-12 md:p-24 rounded-[4rem] obsidian-gradient relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(173,198,255,0.1),transparent_70%)]" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-on-primary">
            HAVE A VISION? <br /> LET'S <span className="text-primary-container">MATERIALIZE</span> IT.
          </h2>
          <p className="text-primary-container/70 text-xl max-w-2xl mx-auto">
            Currently accepting new projects for Q3 2026. Let's create something that pushes the boundaries of the digital medium.
          </p>
          <div className="pt-4">
            <button onClick={() => navigate('/contact')} className="px-12 py-5 bg-on-primary text-primary font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Start a Project
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
