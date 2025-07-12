import React from 'react';
import './HowItWorks.css';
import { Link } from 'react-router-dom';


const techStack = {
  Frontend: ['React', 'TypeScript', 'React Router'],
  Backend: ['Node.js', 'Express', 'Axios', 'dotenv'],
  APIs: ['OpenAI API', 'TMDb API'],
  Hosting: ['Firebase', 'Vercel']
};

const logos = [
  { name: 'React', url: 'https://reactjs.org', img: '/logos/react.png' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org/', img: '/logos/typescript.png' },
  { name: 'React Router', url: 'https://reactrouter.com/', img: '/logos/react-router.png' },
  { name: 'Node.js', url: 'https://nodejs.org/', img: '/logos/nodejs.png' },
  { name: 'Express', url: 'https://expressjs.com/', img: '/logos/express.png' },
  { name: 'Axios', url: 'https://axios-http.com/', img: '/logos/axios.png' },
  { name: 'dotenv', url: 'https://www.npmjs.com/package/dotenv', img: '/logos/dotenv.png' },
  { name: 'OpenAI', url: 'https://platform.openai.com/', img: '/logos/openai.png' },
  { name: 'TMDb', url: 'https://www.themoviedb.org/', img: '/logos/tmdb.png' },
  { name: 'Firebase', url: 'https://firebase.google.com/', img: '/logos/firebase.png' },
  { name: 'Vercel', url: 'https://vercel.com/', img: '/logos/vercel.png' }
];

export default function HowItWorksPage() {
  return (
    <div className="how-it-works">
      <section className="hero">
        <h1>How MovieMatch Works</h1>
        <p>See how your group’s movie tastes become perfectly matched.</p>
      </section>

      <section className="steps">
        <h2>User Flow</h2>
        <ol>
          <li><strong>Create or Join a Room:</strong> Enter a room code or generate one.</li>
          <li><strong>Share Preferences:</strong> Everyone submits a sentence describing their ideal movie.</li>
          <li><strong>Get AI Suggestions:</strong> AI recommends 6 real movies that match everyone’s taste.</li>
          <li><strong>Vote & Watch:</strong> Read the summaries, watch trailers, and vote on your favorite.</li>
        </ol>
      </section>

      <section className="stack">
        <h2>Tech Stack</h2>
        {Object.entries(techStack).map(([category, tools]) => (
          <div key={category} className="stack-category">
            <h3>{category}</h3>
            <ul>
              {tools.map(tool => <li key={tool}>{tool}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section className="logo-carousel">
        <h2>Technologies Used</h2>
        <div className="carousel">
          {logos.map(({ name, url, img }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer">
              <img src={img} alt={name} />
            </a>
          ))}
        </div>
      </section>

      <section className="architecture">
        <h2>System Architecture</h2>
        <pre className="diagram">
{`User
  ↓
React Frontend
  ↓
Express Server
  ↓        ↓
OpenAI    TMDb
  ↓        ↓
Firebase Firestore`}
        </pre>
      </section>

      <section className="code-snippets">
        <h2>Example Code Snippet</h2>
        <pre>
{`// Send preferences to backend
const response = await axios.post('/api/recommend', {
  preferences: ["Funny animated movie", "Short romantic comedy"]
});

// Response: array of recommended movie objects`}
        </pre>
      </section>
    </div>
  );
} 
