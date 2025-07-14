// RoomPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteField,
} from 'firebase/firestore';
import { Check, Clock, Loader, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';



import './RoomPage.css';

const placeholders = [
  'e.g., I love thrillers with plot twists',
  'e.g., Animated comedies under 2 hours',
  'e.g., Something romantic but not cheesy',
  'e.g., Dark sci-fi or dystopian',
  'e.g., Movies with strong female leads',
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
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [title: string]: boolean }>({});
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;


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
      setRecommendations(data.recommendations || []);
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
      // block backend URL
      const response = await fetch(`${BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        preferences: members.map((name) => ({
          name,
          preference: preferences[name]
        }))
      }),

      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setRecommendations(data);
      const roomRef = doc(db, 'rooms', roomId!);
      await updateDoc(roomRef, {
        recommendations: data
      });

    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const roomRef = doc(db, 'rooms', roomId!);

      const preferenceDeletes = members.reduce((acc, member) => {
        acc[`preferences.${member}`] = deleteField();
        return acc;
      }, {} as any);

      await updateDoc(roomRef, {
        ...preferenceDeletes,
        recommendations: deleteField(),
        votes: deleteField(), 
      });

      setMyPreference('');
      setRecommendations([]);
      setToast('🔄 Ready for new preferences!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error("Failed to reset room:", err);
      setError("Failed to reset for new recommendations.");
    }
  };


  const handleVote = async (title: string, direction: 'up' | 'down') => {
  const currentVote = votes[title]?.[userName];
  const roomRef = doc(db, 'rooms', roomId!);

  try {
    if (currentVote === direction) {
      // Remove the vote
      await updateDoc(roomRef, {
        [`votes.${title}.${userName}`]: deleteField()
      });
    } else {
      // Set the new vote
      await updateDoc(roomRef, {
        [`votes.${title}.${userName}`]: direction
      });
    }
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
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="logo">
          <img src="/logo512.png" alt="MM Logo" />
          <Link to="/" className="logo-text">MovieMatch</Link>

        </div>
        <div className="nav-links">
          <a href="https://github.com/owencurt/MovieMatch" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </nav>
      <div className="room-container">
        <header className="room-header">
          <h1 className="room-title">Room: {roomId}</h1>
          <h2 className="room-subtitle">Welcome, <span className="highlight">{userName}</span>!</h2>
        </header>

        {toast && <div className="toast">{toast}</div>}
        {error && <div className="error-msg">{error}</div>}

        {!preferences[userName] && recommendations.length === 0 && (
          <div className="input-area">
            <label className="input-label">Share Your Movie Preference</label>
            <div className="input-block">
              <input
                type="text"
                placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
                value={myPreference}
                onChange={(e) => setMyPreference(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitPreference()}
              />
              <button onClick={handleSubmitPreference}>Submit</button>
            </div>
          </div>
        )}

        <div className="progress-block">
          <div className="progress">
            <span>
              <span className="submitted-count">{submittedCount}</span> of {members.length} users have submitted preferences
            </span>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(submittedCount / members.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div style={{ height: '24px' }} />
          <ul className="preference-list">
              <li className="list-header">Group Preferences</li>
              {members.map((member) => (
                  <li key={member} className="preference-item">
                  <span className="status-icon">
                      {preferences[member] ? <Check size={18} strokeWidth={2.5} /> : <Clock size={18} strokeWidth={2} />}
                  </span>
                  <strong>{member}:</strong> {preferences[member] || 'Waiting...'}
                  </li>
              ))}
          </ul>

        </div>

        {allSubmitted && !loading && (
          recommendations.length === 0 ? (
            <button className="generate-btn" onClick={handleGenerate}>
              Generate Recommendations
            </button>
          ) : (
            <button className="generate-btn" onClick={handleReset}>
              New Recommendations
            </button>
          )
        )}


        {loading && (
          <p className="loading">
              <Loader size={18} className="spin" style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Generating suggestions...
          </p>
          )}


        {recommendations.length > 0 && (
          <div className="recommendation-grid">
            {recommendations.map((movie, i) => {
              const { up, down } = voteStats(movie.title);
              const voted = votes[movie.title]?.[userName];
              return (
                <div className="movie-card" key={i}>
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="movie-poster"
                    />
                  )}
                  <h4 className="movie-title">{movie.title} ({movie.year})</h4>
                  <p className="movie-reason">
                    {expandedDescriptions[movie.title]
                      ? movie.why
                      : movie.why.length > 120
                        ? movie.why.slice(0, 120) + '...'
                        : movie.why}
                  </p>

                  {movie.why.length > 120 && (
                    <span
                      className="show-more-text"
                      onClick={() =>
                        setExpandedDescriptions((prev) => ({
                          ...prev,
                          [movie.title]: !prev[movie.title],
                        }))
                      }
                    >
                      {expandedDescriptions[movie.title] ? 'Show less' : 'Show more'}
                    </span>
                  )}
                  {movie.trailer && (
                    <a href={movie.trailer} className="trailer-link" target="_blank" rel="noopener noreferrer">
                      Watch Trailer
                    </a>
                  )}
                  <div className="vote-row aligned-votes">
                    <div className="vote-block">
                      <span className="vote-number">{up}</span>
                      <button
                        className={voted === 'up' ? 'vote-btn voted' : 'vote-btn'}
                        onClick={() => handleVote(movie.title, 'up')}
                      >
                        <ThumbsUp size={20} />
                      </button>
                    </div>

                    <div className="vote-block">
                      <button
                        className={voted === 'down' ? 'vote-btn voted' : 'vote-btn'}
                        onClick={() => handleVote(movie.title, 'down')}
                      >
                        <ThumbsDown size={20} />
                      </button>
                      <span className="vote-number">{down}</span>
                    </div>
                  </div>


                </div>
              );
            })}
        </div>

        )}
      </div>
    </div>
  );
};

export default RoomPage;
