import React, { useState } from 'react';
import EventsListAll from '../components/EventsListAll';

const EventsPage = ({ events: initialEvents, onUpdateEvents, userID}) => {
  const [events, setEvents] = useState(initialEvents || []);

  const handleEventCreated = (newEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    onUpdateEvents(updatedEvents);
  };

  return (
    <div className="events-page">
      <h2>Все события</h2>
      <EventsListAll events={events} userID={userID} sort={'day'} onEventCreated={handleEventCreated} />
    </div>
  );
};

export default EventsPage;