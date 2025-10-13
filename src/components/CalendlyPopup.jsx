import { useEffect } from 'react';
import { PopupWidget } from 'react-calendly';

const CalendlyPopup = ({ isOpen, onClose, url = "https://calendly.com/m-elboazzati-epmistes/30min" }) => {
  useEffect(() => {
    // Add Calendly CSS if not already present
    const existingLink = document.querySelector('link[href*="calendly"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <PopupWidget
      url={url}
      rootElement={document.getElementById('root')}
      text=""
      textColor="#ffffff"
      color="#2563eb"
      onClose={onClose}
    />
  );
};

export default CalendlyPopup;