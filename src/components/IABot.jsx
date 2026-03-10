import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { postLead } from '../utils/postLead.js';

const MessageContent = ({ content, role }) => {
  const textColorClass = role === 'user' ? 'text-white' : 'text-gray-800';
  return (
    <div className={`whitespace-pre-wrap ${textColorClass}`}>
      {content}
    </div>
  );
};

const IABot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: '👋 Bienvenue ! Je suis DevNomad Assistant, votre interlocuteur pour discuter de vos projets digitaux avec Malik.',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (messageText = null, isAutoMessage = false) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    if (!isAutoMessage) {
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: isAutoMessage ? [] : [...messages, userMessage], sessionId })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      let assistantMessage = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;
        setCurrentStreamingMessage(assistantMessage);
      }

      const finalMessage = { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() };
      setMessages(prev => (isAutoMessage ? [finalMessage] : [...prev, finalMessage]));
      setCurrentStreamingMessage('');

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '🤖 Oups ! Petite connexion difficile... Pouvez-vous reformuler votre message ?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage('');
    }
  };

  const _createLead = async (leadData) => {
    try {
      const result = await postLead({
        ...leadData,
        source: 'chatbot'
      });

      if (result?.ok) {
        const confirm = {
          role: 'assistant',
          content: '✅ Parfait ! J\'ai bien transmis vos informations à Malik EL BOAZZATI. Il vous recontactera sous 24h pour discuter de votre projet.',
          timestamp: new Date().toISOString()
        };

        const followUp = {
          role: 'assistant',
          content: "En attendant, n'hésitez pas à me poser d'autres questions sur les technologies ou à réserver directement un appel : https://calendly.com/m-elboazzati-epmistes/30min",
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, confirm, followUp]);
        return true;
      }
    } catch (error) {
      console.error('Erreur création lead:', error);
      const errMsg = {
        role: 'assistant',
        content: "❗ Impossible d'enregistrer votre demande pour le moment. Vous pouvez réessayer.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    }
    return false;
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 px-5 py-3 hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
        >
          <span aria-hidden="true" className="text-lg">🤖</span>
          <span className="text-sm font-semibold">Parler à l&apos;IA</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
          </span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold">DevNomad Assistant</h3>
                  <p className="text-xs opacity-90">Spécialiste Flutter + IA</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                ✕
              </motion.button>
            </div>

            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                    message.role === 'assistant'
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      <MessageContent content={message.content} role={message.role} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {currentStreamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex justify-start"
                >
                  <div className="max-w-[85%] rounded-lg p-3 bg-white text-gray-800 border border-gray-200 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {currentStreamingMessage}
                    </p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="Décrivez votre projet..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➤
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IABot;