// RoomPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

import './RoomPage.css';

const placeholders = [
  'I love thrillers with plot twists',
  'Animated comedies under 2 hours',
  'Something romantic but not cheesy',
  'Dark sci-fi or dystopian',
  'Movies with strong female leads',
];

const RoomPage: React.FC = () => {
  const { roomId } = useParams();
  const [members, setMembers] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<{ [key: string]: string }>({});
  const [userName, setUserName] = useState('');
  const [myPreference, setMyPreference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [votes, setVotes] = useState<{ [title: string]: { [user: string]: 'up' | 'down' } }>({});
  const [toast, setToast] = useState('');

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
      setVotes(data.votes || {});
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
      setToast('✅ Preference submitted!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error submitting preference:', err);
      setError('Failed to submit preference.');
    }
  };

  const allSubmitted = members.every((member) => preferences[member]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: members.map((name) => preferences[name]) }),
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (title: string, direction: 'up' | 'down') => {
    const currentVote = votes[title]?.[userName];
    if (currentVote === direction) return;
    const roomRef = doc(db, 'rooms', roomId!);
    try {
      await updateDoc(roomRef, {
        [`votes.${title}.${userName}`]: direction,
      });
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const voteStats = (title: string) => {
    const voteEntries = Object.values(votes[title] || {});
    return {
      up: voteEntries.filter((v) => v === 'up').length,
      down: voteEntries.filter((v) => v === 'down').length,
    };
  };

  const submittedCount = members.filter((m) => preferences[m]).length;

  return (
    <div className="room-container">
      <h1>Room: {roomId}</h1>
      <h2>Welcome, {userName}</h2>

      {toast && <div className="toast">{toast}</div>}
      {error && <div className="error-msg">{error}</div>}

      {!preferences[userName] && recommendations.length === 0 && (
        <div className="input-block">
          <input
            type="text"
            placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
            value={myPreference}
            onChange={(e) => setMyPreference(e.target.value)}
          />
          <button onClick={handleSubmitPreference}>Submit</button>
        </div>
      )}

      <div className="progress">{submittedCount} of {members.length} submitted</div>

      <ul className="preference-list">
        {members.map((member) => (
          <li key={member}>
            <strong>{member}</strong>: {preferences[member] || '⏳ Waiting...'}
          </li>
        ))}
      </ul>

      {allSubmitted && !loading && (
        <button className="generate-btn" onClick={handleGenerate}>
          Generate Recommendations
        </button>
      )}

      {loading && <p className="loading">🔄 Generating suggestions...</p>}

      {recommendations.length > 0 && (
        <div className="recommendation-grid">
          {recommendations.map((movie, i) => {
            const { up, down } = voteStats(movie.title);
            const voted = votes[movie.title]?.[userName];
            return (
              <div className="movie-card" key={i}>
                {movie.poster && <img src={movie.poster} alt={movie.title} />}
                <h4>{movie.title} ({movie.year})</h4>
                <p>{movie.why}</p>
                {movie.trailer && <a href={movie.trailer} target="_blank">Watch Trailer</a>}
                <div className="vote-row">
                  <button className={voted === 'up' ? 'voted' : ''} onClick={() => handleVote(movie.title, 'up')}>👍</button>
                  <button className={voted === 'down' ? 'voted' : ''} onClick={() => handleVote(movie.title, 'down')}>👎</button>
                </div>
                {voted && (
                  <div className="vote-counts">
                    <span>👍 {up}</span> <span>👎 {down}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomPage;
