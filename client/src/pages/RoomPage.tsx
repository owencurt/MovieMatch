// src/pages/RoomPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const RoomPage: React.FC = () => {
  const { roomId } = useParams();
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (!docSnap.exists()) {
        setError('Room not found.');
        return;
      }

      const data = docSnap.data();
      setMembers(data.members || []);
    });

    return () => unsub();
  }, [roomId]);

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red', marginTop: '100px' }}>{error}</p>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '100px auto', textAlign: 'center' }}>
      <h1>Room: {roomId}</h1>
      <h2>Members:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {members.map((name, idx) => (
          <li key={idx} style={{ fontSize: '18px', padding: '5px 0' }}>
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomPage;
