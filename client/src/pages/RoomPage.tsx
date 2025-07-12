import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  increment,
} from 'firebase/firestore';

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
    } catch (err) {
      console.error('Error submitting preference:', err);
      setError('Failed to submit preference.');
    }
  };

  const allSubmitted = members.every((member) => preferences[member]);

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '100px' }}>{error}</p>;
  }

    const handleGenerate = async () => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:4000/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            preferences: members.map((name) => preferences[name]),
        }),
        });

        if (!response.ok) throw new Error('Server error');

        const data = await response.json();

        // Store in localStorage or state, depending on how you want to show them in Step 11
        setRecommendations(data);
        setLoading(false);
        // TODO: Redirect or display movie results in next step
    } catch (err) {
        console.error('Error generating recommendations:', err);
        setError('Failed to get recommendations.');
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

    const countVotes = (title: string) => {
        const voteEntries = Object.values(votes[title] || {});
        return voteEntries.length;
    };

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
      <h1>Room: {roomId}</h1>

      <h2>Welcome, {userName}!</h2>

      {!preferences[userName] && recommendations.length === 0 && (
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

      {allSubmitted && !loading && (
        <button
            onClick={handleGenerate}
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

        {loading && <p style={{ marginTop: '30px' }}>🔄 Generating suggestions...</p>}

        {recommendations.length > 0 && (
            <div style={{ marginTop: '40px' }}>
                <h2>Recommended Movies:</h2>
                <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '20px',
                }}
                >
                {recommendations.map((movie, index) => {
                    const userVote = votes[movie.title]?.[userName] || null;
                    const voteEntries = Object.values(votes[movie.title] || {});
                    const upvotes = voteEntries.filter((v) => v === 'up').length;
                    const downvotes = voteEntries.filter((v) => v === 'down').length;

                    return (
                    <div
                        key={index}
                        style={{
                        width: '200px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'left',
                        background: '#f9f9f9',
                        }}
                    >
                        {movie.poster && (
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            style={{ width: '100%', borderRadius: '6px' }}
                        />
                        )}
                        <h4 style={{ margin: '10px 0 5px' }}>
                        {movie.title} ({movie.year})
                        </h4>
                        <p style={{ fontSize: '0.9em' }}>{movie.why}</p>
                        {movie.trailer && (
                        <a
                            href={movie.trailer}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', marginBottom: '10px' }}
                        >
                            Watch Trailer
                        </a>
                        )}
                        <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px',
                        }}
                        >
                        <div>
                            <button
                            onClick={() => handleVote(movie.title, 'up')}
                            style={{
                                background:
                                userVote === 'up' ? '#d4edda' : '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                            }}
                            >
                            👍
                            </button>
                            <button
                            onClick={() => handleVote(movie.title, 'down')}
                            style={{
                                background:
                                userVote === 'down' ? '#f8d7da' : '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                marginLeft: '5px',
                                cursor: 'pointer',
                            }}
                            >
                            👎
                            </button>
                        </div>
                        <div style={{ fontSize: '0.85em', textAlign: 'right' }}>
                            <div>👍 {upvotes}</div>
                            <div>👎 {downvotes}</div>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
    )}

    </div>
  );
};

export default RoomPage;
