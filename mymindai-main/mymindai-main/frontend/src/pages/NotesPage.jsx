import React, { useState } from 'react';
import NoteListAll from '../components/NoteListAll';

const NotesPage = ({ notes: initialNotes, onUpdateNotes, userID}) => {
  const [notes, setNotes] = useState(initialNotes || []);

  const handleNoteCreated = (newNote) => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onUpdateNotes(updatedNotes);
  };

  return (
    <div className="events-page">
      <h2>Все заметки</h2>
      <NoteListAll notes={notes} userID={userID} onNoteCreated={handleNoteCreated} />
    </div>
  );
};

export default NotesPage;