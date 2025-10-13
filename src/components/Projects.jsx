import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/Projects.css';

const projects = [
  {
    title: 'App E-commerce Flutter + FastAPI',
    description:
      'Application mobile iOS/Android avec backend FastAPI et IA de recommandation. Paiement Stripe intégré, gestion stock temps réel, chatbot support client.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    tags: ['Flutter', 'FastAPI', 'PostgreSQL', 'OpenAI', 'Stripe'],
    link: '#',
    metrics: 'MVP livré en 3 semaines'
  },
  {
    title: 'Dashboard SaaS + Automatisation IA',
    description:
      'Plateforme SaaS multi-tenant avec API Node.js, automatisations IA pour génération de rapports et chatbot qualifiant intégré.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    tags: ['React', 'Node.js', 'MongoDB', 'Anthropic', 'TypeScript'],
    link: '#',
    metrics: '40% réduction temps de traitement'
  },
  {
    title: 'Marketplace Flutter + IA Matching',
    description:
      'Marketplace mobile avec algorithme IA de matching intelligent, messagerie temps réel, et système de notation. Backend scalable avec FastAPI.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    tags: ['Flutter', 'FastAPI', 'Redis', 'TensorFlow', 'WebSocket'],
    link: '#',
    metrics: 'Architecture pour 10k+ utilisateurs'
  },
];

const ProjectCard = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: '-30px 0px',
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: [0.25, 0.25, 0, 1]
      }}
      className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700/50 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.image}
          alt={`Capture d'écran du projet ${project.title} développé par Malik El Boazzati`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {project.title}
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{project.description}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {project.metrics && (
          <div className="mb-4 p-2 bg-green-50 rounded-lg">
            <p className="text-xs font-semibold text-green-800">🎯 {project.metrics}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.open('https://calendly.com/m-elboazzati-epmistes/30min', '_blank')}
          >
            Discuter du projet
          </motion.button>
          
          <span className="text-xs text-gray-500">Étude de cas disponible</span>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '0px 0px',
  });

  return (
    <section id="projects" className="bg-white dark:bg-gray-900 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
              Projets récents
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Des MVP fonctionnels livrés rapidement avec Flutter, backends robustes et IA intégrée.
              Chaque projet est conçu pour évoluer avec votre croissance.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects; 