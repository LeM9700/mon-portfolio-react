import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CTAButton from './CTAButton';

const IASection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const services = [
    {
      icon: '📱',
      title: 'MVP Mobile Flutter',
      description: 'Une seule équipe, une seule codebase — votre app tourne sur iOS et Android sans compromis sur la fluidité ni les performances.',
      deliverable: 'Livraison en 2-4 semaines',
      technologies: ['Flutter', 'Dart', 'iOS', 'Android']
    },
    {
      icon: '⚡',
      title: 'Backend API Robuste',
      description: 'Votre app ne tombera pas en rade si elle passe à la TV. Sécurisée, scalable, prête pour 10 000 utilisateurs dès la V1.',
      deliverable: 'Architecture prête pour 10k+ utilisateurs',
      technologies: ['FastAPI', 'Node.js', 'PostgreSQL', 'Docker']
    },
    {
      icon: '🤖',
      title: 'Intégration IA Intelligente',
      description: 'Pas de l\'IA gadget — de l\'IA qui fait gagner du temps à vos utilisateurs : recommandations, automatisations, assistants conversationnels.',
      deliverable: 'ROI mesurable dès la première semaine',
      technologies: ['OpenAI', 'Anthropic', 'LangChain', 'RAG']
    }
  ];

  return (
    <section id="ia-section" className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-white">
            Votre MVP de A à Z
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Je transforme vos idées en MVP fonctionnels avec une approche 360° : 
            <span className="text-blue-400 font-semibold"> mobile + backend + IA</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Accompagnement complet
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Livraison rapide
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Architecture évolutive
            </span>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4" aria-hidden="true">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-200 mb-4 leading-relaxed">{service.description}</p>
              
              <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-400 text-sm font-semibold">✓ {service.deliverable}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {service.technologies.map(tech => (
                  <span 
                    key={tech}
                    className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full border border-white/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Processus de développement
          </h3>
          
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '1', title: 'Analyse', desc: 'Audit de vos besoins et définition du scope' },
              { step: '2', title: 'Conception', desc: 'Architecture technique et maquettes UI/UX' },
              { step: '3', title: 'Développement', desc: 'Code itératif avec démos hebdomadaires' },
              { step: '4', title: 'Lancement', desc: 'Déploiement et formation utilisateurs' }
            ].map((phase, index) => (
              <div key={phase.step} className="relative">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {phase.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block flex-1 h-px bg-white/20 ml-4"></div>
                  )}
                </div>
                <h4 className="text-white font-semibold mb-2">{phase.title}</h4>
                <p className="text-gray-300 text-sm">{phase.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Prêt à transformer votre idée en réalité ?
          </h3>
          <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
            Discutons de votre projet lors d'un appel de 30 minutes. 
            Je vous présente une approche technique adaptée à vos contraintes et objectifs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CTAButton
              href="https://calendly.com/m-elboazzati-epmistes/30min"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="xl"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <span aria-hidden="true">🚀</span> Réserver un appel gratuit
            </CTAButton>
            
            <p className="text-sm text-gray-300">
              Pas d'engagement • Conseil personnalisé • 30 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IASection;
