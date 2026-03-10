import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import IASection from './components/IASection';
import IABot from './components/IABot';
import CalendlyListener from './components/CalendlyListener';

function App() {
  const [isIABotOpen, setIsIABotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showNavbar, setShowNavbar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = () => {
    const sections = ['home', 'about', 'skills', 'projects', 'ia-section'];
    const scrollPosition = window.scrollY + 100;

    // Show/hide navbar based on scroll
    setShowNavbar(window.scrollY > 100);

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(section);
          break;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Navigation glassmorphism liquide responsive */}
      <AnimatePresence>
        {showNavbar && (
          <>
            {/* Desktop Navigation */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden md:block"
            >
              <nav className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-full px-6 py-3 shadow-2xl shadow-black/10">
                <div className="flex items-center gap-1">
                  {[
                    { name: 'À propos', id: 'about', icon: '👤' },
                    { name: 'Compétences', id: 'skills', icon: '⚡' },
                    { name: 'Projets', id: 'projects', icon: '🚀' },
                    { name: 'IA', id: 'ia-section', icon: '🤖' }
                  ].map((item) => (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.id)}
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Background actif liquide */}
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="activeNavBg"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-full shadow-lg"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      {/* Contenu */}
                      <span className="relative z-10 flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                    </motion.button>
                  ))}
                  
                  {/* Separator */}
                  <div className="w-px h-6 bg-gray-300/30 dark:bg-gray-600/30 mx-2"></div>
                  
                  {/* Chat IA Button */}
                  <motion.button
                    onClick={() => {
                      scrollToSection('ia-section');
                      setTimeout(() => setIsIABotOpen(true), 800);
                    }}
                    className="relative px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <span>💬</span>
                      <span>Chat</span>
                    </span>
                  </motion.button>
                </div>
              </nav>
            </motion.div>

            {/* Mobile Navigation */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-4 right-4 z-50 md:hidden"
            >
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-full p-3 shadow-2xl shadow-black/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                  <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                </div>
              </motion.button>
            </motion.div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="fixed top-16 right-4 z-50 md:hidden"
                >
                  <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-2xl p-4 shadow-2xl shadow-black/10 min-w-[200px]">
                    <div className="flex flex-col gap-2">
                      {[
                        { name: 'À propos', id: 'about', icon: '👤' },
                        { name: 'Compétences', id: 'skills', icon: '⚡' },
                        { name: 'Projets', id: 'projects', icon: '🚀' },
                        { name: 'IA', id: 'ia-section', icon: '🤖' }
                      ].map((item) => (
                        <motion.button
                          key={item.name}
                          onClick={() => {
                            scrollToSection(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                            activeSection === item.id
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.name}</span>
                        </motion.button>
                      ))}
                      
                      <div className="h-px bg-gray-300/30 dark:bg-gray-600/30 my-2"></div>
                      
                      <motion.button
                        onClick={() => {
                          scrollToSection('ia-section');
                          setTimeout(() => setIsIABotOpen(true), 800);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-lg">💬</span>
                        <span>Chat IA</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      <div className="w-full">
        <Header />
        <main className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <About />
              <Skills />
              <Projects />
              <IASection />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <IABot isOpen={isIABotOpen} setIsOpen={setIsIABotOpen} />
      <CalendlyListener />
    </div>
  );
}

export default App;
