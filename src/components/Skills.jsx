// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const skills = [
  {
    category: 'Développement Web',
    skills: [
      { name: 'React.js', level: 90, color: 'bg-blue-500' },
      { name: 'Next.js', level: 85, color: 'bg-gray-800' },
      { name: 'TypeScript', level: 80, color: 'bg-blue-600' },
      { name: 'Node.js', level: 75, color: 'bg-green-500' },
    ],
  },
  {
    category: 'Développement Mobile',
    skills: [
      { name: 'Flutter', level: 85, color: 'bg-blue-500' },
      { name: 'Riverpod / BLoC', level: 85, color: 'bg-cyan-500' },
      { name: 'Dart', level: 85, color: 'bg-indigo-500' },
    ],
  },
  {
    category: 'Intelligence Artificielle',
    skills: [
      { name: 'Python', level: 90, color: 'bg-yellow-500' },
      { name: 'TensorFlow', level: 75, color: 'bg-orange-500' },
      { name: 'Chatbots', level: 85, color: 'bg-emerald-500' },
    ],
  },
];

const getLevelLabel = (level) => {
  if (level >= 90) return { label: 'Expert', color: 'text-blue-600 dark:text-blue-400' };
  if (level >= 80) return { label: 'Avancé', color: 'text-purple-600 dark:text-purple-400' };
  if (level >= 70) return { label: 'Maîtrisé', color: 'text-emerald-600 dark:text-emerald-400' };
  return { label: 'En progression', color: 'text-orange-500 dark:text-orange-400' };
};

const SkillBar = ({ skill, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
    rootMargin: '0px 0px -20px 0px',
  });

  const { label, color } = getLevelLabel(skill.level);

  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between items-center">
        <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          ref={ref}
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : {}}
          transition={{
            duration: 1.5,
            delay: delay * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={`h-full rounded-full ${skill.color}`}
        />
      </div>
    </div>
  );
};

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
    rootMargin: '-50px 0px',
  });

  return (
    <section id="skills" className="bg-gray-50 dark:bg-gray-800 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.25, 0.25, 0, 1] }}
        >
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 dark:text-gray-100">
            La stack qui livre vos projets
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {skills.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: inView ? index * 0.2 : 0,
                  ease: [0.25, 0.25, 0, 1]
                }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg transition-colors duration-300"
              >
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {category.category}
                </h3>
                {category.skills.map((skill, skillIndex) => (
                  <SkillBar key={skill.name} skill={skill} delay={skillIndex} />
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills; 