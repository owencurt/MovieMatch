# 🎬 MovieMatch -- *IN DEVELOPMENT*

An AI-powered web app that helps groups of friends choose a movie to watch — together. Each user enters their movie preferences, and the system uses ChatGPT + TMDb to generate suggestions that satisfy everyone's taste.

---

## 🔧 Tech Stack

| Layer      | Tech                          | Why                                      |
|------------|-------------------------------|-------------------------------------------|
| Frontend   | React + TypeScript            | Modern, reusable UI components            |
| Backend    | Node.js + Express             | API logic and routing                     |
| AI Logic   | OpenAI API (gpt-3.5 / gpt-4)  | Generates movie suggestions from input    |
| Movie Data | TMDb API                      | Real movie data (posters, runtime, etc.)  |
| Database   | Firebase Firestore            | Stores room data and user preferences     |
| Hosting    | Vercel (client) + Render (server) | Free, scalable deployment             |

---

## 💡 Features

- 👥 Create or join a room with a 6-character code
- 🎭 Each user submits their movie preferences
- 🧠 AI merges preferences into 5 smart suggestions
- 🎥 Each movie has poster, trailer, description, runtime
- 👍 Optional voting system per group
- 🔐 (Optional) Google Auth and session persistence
- 💾 Save past recommendations (optional)

---
