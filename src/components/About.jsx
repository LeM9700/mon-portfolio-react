import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import avatarImage from '../assets/images/avatar_optimized.png';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.25,
    rootMargin: '-20px 0px',
  });

  return (
    <section id="about" className="min-h-screen bg-white dark:bg-gray-900 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.25, 0, 1] }}
          className="grid grid-cols-1 gap-12 md:grid-cols-2"
        >
          {/* Photo professionnelle */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-lg shadow-2xl"
            >
              <img
                src={avatarImage}
                alt="Malik El Boazzati, développeur Flutter et backend spécialisé en IA"
                className="w-full h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 rounded-lg bg-blue-500 p-4 text-white shadow-lg"
            >
              <p className="text-sm font-semibold">+5 ans d'expérience</p>
            </motion.div>
          </div>

          {/* Texte de présentation */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-gray-100">
              Mon expertise au service de vos MVP
            </h2>
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
              <strong>Développeur Flutter & Backend</strong> spécialisé dans la création d'applications 
              mobiles iOS/Android performantes avec des APIs robustes et des intégrations IA intelligentes.
            </p>
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
              Je transforme vos idées en <strong>MVP fonctionnels en 2-4 semaines</strong>, 
              avec une architecture évolutive qui grandit avec votre business.
            </p>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Ma valeur ajoutée :</span> Une approche 
              complète du mobile au backend, enrichie par l'IA pour créer des expériences utilisateur 
              exceptionnelles et automatiser vos processus métier.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Stack technique principale :</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  'Flutter (iOS/Android)',
                  'FastAPI',
                  'Node.js',
                  'OpenAI/Anthropic',
                  'React.js',
                  'PostgreSQL',
                  'Firebase',
                  'Docker'
                ].map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                >
                  {skill}
                </motion.span>
              ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About; 