# 🎬 MovieMatch

🌐 [Visit Site!](https://moviematch-nine.vercel.app/)

An AI-powered web app that helps groups of friends choose a movie to watch — together. Each user enters their movie preferences, and the system uses ChatGPT + TMDb to generate suggestions that satisfy everyone's taste.

#### UI strongly inspired by [softgen.ai](https://softgen.ai)

---

## 🔧 Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React + TypeScript + css      |
| Backend    | Node.js + Express             |
| API's      | OpenAI API, TMDb API          |
| Database   | Firebase Firestore            |
| Hosting    | Vercel (client) + Render (server) |

---

## 💡 Features

- 👥 Create or join a room with a 6-character code  
- 🎭 Each user submits their movie preferences  
- 🧠 AI merges preferences into 5 smart suggestions  
- 🎥 Each movie has poster, trailer, description, runtime  
- 👍 Voting system per group  

---

## 🛠️ Getting Started

Follow these steps to run MovieMatch locally.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/moviematch.git
cd moviematch
```

### 2. Install dependencies
Install the frontend and backend dependencies separately:

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Set up environment variables

You will need .env files in both the client/ and server/ directories.

In client/.env:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
BACKEND_URL=https://your-backend-url.onrender.com
```

In server/.env:
```env
OPENAI_API_KEY=your_openai_api_key
TMDB_API_KEY=your_tmdb_api_key
```

### 4. Required APIs and Services

#### 🔑 OpenAI API
Sign up at https://platform.openai.com

Create an API key and add it to server/.env as OPENAI_API_KEY  
&nbsp; 

#### 🎬 TMDb API
Create an account at https://www.themoviedb.org/

Get your API key from https://www.themoviedb.org/settings/api

Add it to server/.env as TMDB_API_KEY  
&nbsp; 

#### 🔧 Render (for backend hosting)
Create an account at https://render.com

Deploy the server/ folder as a web service

Set the environment variables in Render's dashboard

Use the deployed URL in your client/.env as VITE_BACKEND_URL  
&nbsp; 

### 5. Run development servers

From the root folder:

Frontend (client):

```bash
cd client
npm run dev
```

Backend (server):

```bash
cd server
npm run dev
```

The app should now be running locally
