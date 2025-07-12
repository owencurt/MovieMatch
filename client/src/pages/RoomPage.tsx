import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

const RoomPage: React.FC = () => {
  const { roomId } = useParams();
  const [members, setMembers] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<{ [key: string]: string }>({});
  const [userName, setUserName] = useState('');
  const [myPreference, setMyPreference] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (!name) {
      setError('No user name found. Please go back and enter your name.');
      return;
    }
    setUserName(name);

    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap.exists()) {
        setError('Room not found.');
        return;
      }

      const data = docSnap.data();
      setMembers(data.members || []);
      setPreferences(data.preferences || {});
    });

    return () => unsub();
  }, [roomId]);

  const handleSubmitPreference = async () => {
    if (!myPreference.trim()) return;

    try {
      const roomRef = doc(db, 'rooms', roomId!);
      await updateDoc(roomRef, {
        [`preferences.${userName}`]: myPreference,
      });
    } catch (err) {
      console.error('Error submitting preference:', err);
      setError('Failed to submit preference.');
    }
  };

  const allSubmitted = members.every((member) => preferences[member]);

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '100px' }}>{error}</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
      <h1>Room: {roomId}</h1>

      <h2>Welcome, {userName}!</h2>

      {!preferences[userName] && (
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Describe your movie preference"
            value={myPreference}
            onChange={(e) => setMyPreference(e.target.value)}
            style={{ width: '80%', padding: '10px' }}
          />
          <button
            onClick={handleSubmitPreference}
            style={{ padding: '10px 20px', marginLeft: '10px' }}
          >
            Submit
          </button>
        </div>
      )}

      <h3>Submitted Preferences:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {members.map((member) => (
          <li key={member} style={{ fontSize: '16px', margin: '6px 0' }}>
            <strong>{member}</strong>: {preferences[member] || '⏳ Waiting...'}
          </li>
        ))}
      </ul>

      {allSubmitted && (
        <button
          style={{
            marginTop: '30px',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Generate Recommendations
        </button>
      )}
    </div>
  );
};

export default RoomPage;
