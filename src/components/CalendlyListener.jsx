import { useEffect } from 'react';

const CalendlyListener = () => {
  useEffect(() => {
    const handleCalendlyEvent = async (e) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          try {
            // Extract event details
            const eventDetails = e.data.payload;
            
            // Create lead from Calendly booking
            const leadData = {
              source: 'calendly',
              firstName: eventDetails.invitee?.first_name || '',
              lastName: eventDetails.invitee?.last_name || '', 
              email: eventDetails.invitee?.email || '',
              summary: `Appel programmé via Calendly - ${eventDetails.event_type?.name || 'Consultation'}`,
              budget: 'unknown',
              deadline: 'discussed_on_call',
              platforms: [],
              aiNeeds: ['unknown'],
              notes: `Event URI: ${eventDetails.uri || ''}, Scheduled time: ${eventDetails.scheduled_event?.start_time || ''}`
            };

            // Send to leads API
            const response = await fetch('/api/leads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(leadData)
            });

            if (response.ok) {
              console.log('Lead créé automatiquement depuis Calendly:', leadData);
              
              // Optional: Show success notification
              if (window.showNotification) {
                window.showNotification('Rendez-vous confirmé ! Je vous enverrai un email de préparation.', 'success');
              }
            }
          } catch (error) {
            console.error('Erreur lors de la création du lead Calendly:', error);
          }
        }
      }
    };

    // Listen for Calendly events
    window.addEventListener('message', handleCalendlyEvent);
    
    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default CalendlyListener;