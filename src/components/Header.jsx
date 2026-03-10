import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CTAButton from './CTAButton';
import CalendlyPopup from './CalendlyPopup';
import ContactForm from './ContactForm';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // P8 — Focus trap + Escape + backdrop close
  useEffect(() => {
    if (!isContactFormOpen) return;

    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const modal = document.getElementById('contact-modal');
    if (!modal) return;

    const els = Array.from(modal.querySelectorAll(FOCUSABLE));
    const first = els[0];
    const last = els[els.length - 1];
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { setIsContactFormOpen(false); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isContactFormOpen]);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <header id="home" className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
      
      {/* Dark mode toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </motion.button>
      {/* Background animé */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-bg.svg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-800/80" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center pb-28 sm:pb-32">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
            Je conçois vos applications{' '}
            <span className="text-blue-400">mobiles iOS/Android</span>{' '}
            en <span className="text-green-400">Flutter</span>
          </h1>
          <p className="mb-8 text-xl text-gray-300 md:text-2xl max-w-3xl mx-auto">
            Avec backend <span className="text-blue-300">FastAPI/Node</span> et intégration{' '}
            <span className="text-orange-400">IA</span> pour des MVP rapides et scalables
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <CTAButton
              variant="gradient"
              size="xl"
              onClick={() => setIsCalendlyOpen(true)}
              className="min-w-[280px]"
            >
              <span aria-hidden="true">📅</span> Réserver un appel (30 min)
            </CTAButton>

            <CTAButton
              variant="ghost"
              size="lg"
              onClick={() => setIsContactFormOpen(true)}
              className="min-w-[220px]"
            >
              <span aria-hidden="true">✉️</span> Décrire mon projet
            </CTAButton>
          </div>

          <p className="text-sm text-gray-400 mb-8">
            <span aria-hidden="true">🎯</span> MVP en 2-4 semaines • <span aria-hidden="true">📱</span> iOS + Android • <span aria-hidden="true">🤖</span> IA intégrée
          </p>

          {/* Scroll indicator */}
          <motion.div
            className="flex flex-col items-center gap-1 text-white/40 cursor-default select-none"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <span className="text-[10px] tracking-widest uppercase">Découvrir</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Navigation glassmorphism */}
        <nav className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-full px-4 sm:px-8 py-3 sm:py-4 border border-white/20 shadow-2xl shadow-black/20"
          >
            <div className="flex gap-3 sm:gap-6">
              {[
                { name: 'À propos', id: 'about', icon: '👤' },
                { name: 'Compétences', id: 'skills', icon: '⚡' },
                { name: 'Projets', id: 'projects', icon: '🚀' },
                { name: 'IA', id: 'ia-section', icon: '🤖' }
              ].map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    const element = document.getElementById(item.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-300 hover:text-white text-xs sm:text-sm font-medium transition-all duration-300 relative group px-2 sm:px-4 py-2 rounded-full"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="hidden sm:inline">{item.name}</span>
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </nav>
      </div>

      {/* Calendly Popup */}
      <CalendlyPopup 
        isOpen={isCalendlyOpen} 
        onClose={() => setIsCalendlyOpen(false)} 
      />

      {/* Contact Form Modal */}
      {isContactFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => { if (e.target === e.currentTarget) setIsContactFormOpen(false); }}
        >
          <div
            id="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 id="contact-modal-title" className="text-xl font-bold">Décrivez votre projet</h2>
              <button
                onClick={() => setIsContactFormOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <ContactForm onClose={() => setIsContactFormOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
