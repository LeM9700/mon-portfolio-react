import { useState } from 'react';
import { motion } from 'framer-motion';
import CTAButton from './CTAButton';

const ContactForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    budget: '',
    deadline: '',
    platforms: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const budgetOptions = [
    { value: '<3k', label: 'Moins de 3 000€' },
    { value: '3-8k', label: '3 000€ - 8 000€' },
    { value: '8-20k', label: '8 000€ - 20 000€' },
    { value: '20k+', label: 'Plus de 20 000€' }
  ];

  const platformOptions = [
    { value: 'iOS', label: 'iOS (iPhone/iPad)' },
    { value: 'Android', label: 'Android' },
    { value: 'Web', label: 'Application Web' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.description.trim()) newErrors.description = 'Description du projet requise';
    if (!formData.budget) newErrors.budget = 'Budget requis';
    if (formData.platforms.length === 0) newErrors.platforms = 'Au moins une plateforme requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const leadData = {
        source: 'portfolio',
        ...formData,
        summary: formData.description,
        aiNeeds: ['unknown'] // Will be discussed
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API secret if available in environment
      if (import.meta.env.VITE_API_SECRET) {
        headers['X-API-Secret'] = import.meta.env.VITE_API_SECRET;
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers,
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ submit: 'Erreur lors de l\'envoi. Veuillez réessayer.' });
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlatformChange = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
    if (errors.platforms) {
      setErrors(prev => ({ ...prev, platforms: '' }));
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Merci !</h3>
        <p className="text-gray-600">
          Votre demande a été envoyée. Je vous recontacte sous 24h pour discuter de votre projet.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Décrivez votre projet
        </h2>
        <p className="text-gray-600">
          Je vous recontacte sous 24h pour un premier échange
        </p>
      </div>

      {/* Nom et prénom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre prénom"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre nom"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email professionnel *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="votre.email@entreprise.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description du projet *
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Décrivez votre projet en quelques lignes : objectif, fonctionnalités principales, utilisateurs cibles..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Plateformes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plateformes souhaitées *
        </label>
        <div className="space-y-2">
          {platformOptions.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.platforms.includes(option.value)}
                onChange={() => handlePlatformChange(option.value)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.platforms && <p className="text-red-500 text-sm mt-1">{errors.platforms}</p>}
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
          Budget estimé *
        </label>
        <select
          id="budget"
          value={formData.budget}
          onChange={(e) => handleInputChange('budget', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.budget ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Sélectionnez une fourchette</option>
          {budgetOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
          Délai souhaité
        </label>
        <select
          id="deadline"
          value={formData.deadline}
          onChange={(e) => handleInputChange('deadline', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionnez un délai</option>
          <option value="asap">Dès que possible</option>
          <option value="1m">Dans 1 mois</option>
          <option value="1-3m">Dans 1 à 3 mois</option>
          <option value="3-6m">Dans 3 à 6 mois</option>
          <option value="no-rush">Pas d&apos;urgence</option>
        </select>
      </div>

      {errors.submit && (
        <div className="text-red-500 text-sm text-center">{errors.submit}</div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <CTAButton
          type="submit"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </CTAButton>
      </div>
    </motion.form>
  );
};

export default ContactForm;