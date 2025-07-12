import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

const LandingPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateRoom = async (): Promise<void> => {
    if (!userName.trim()) {
      setError('Please enter your name before creating a room.');
      return;
    }

    const code = generateRoomCode();
    const roomRef = doc(db, 'rooms', code);
    const existingSnap = await getDoc(roomRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const createdAt = data?.createdAt?.toMillis?.() ?? 0;
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

      if (createdAt < twelveHoursAgo) {
        await deleteDoc(roomRef); // Cleanup old room
      } else {
        return handleCreateRoom(); // Collision: generate a new code
      }
    }

    try {
      await setDoc(roomRef, {
        roomId: code,
        members: [userName],
        createdAt: Timestamp.now(),
      });

      localStorage.setItem('userName', userName);
      navigate(`/room/${code}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !joinCode.trim()) {
      setError('Please enter both your name and a room code.');
      return;
    }

    const code = joinCode.toUpperCase();
    const roomRef = doc(db, 'rooms', code);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setError('Room not found.');
      return;
    }

    const data = roomSnap.data();
    const createdAt = data?.createdAt?.toMillis?.() ?? 0;
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

    if (createdAt < twelveHoursAgo) {
      await deleteDoc(roomRef);
      setError('This room expired and has been deleted.');
      return;
    }

    try {
      await updateDoc(roomRef, {
        members: arrayUnion(userName),
      });

      localStorage.setItem('userName', userName);
      navigate(`/room/${code}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h1>MovieMatch</h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />

      <button onClick={handleCreateRoom} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
        Create Room
      </button>

      <input
        type="text"
        placeholder="Enter room code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />

      <button onClick={handleJoinRoom} style={{ width: '100%', padding: '10px' }}>
        Join Room
      </button>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default LandingPage;
