# CareerPrep 🚀

**Your AI-Powered Career Preparation Platform**

CareerPrep is a comprehensive career preparation tool that leverages AI to help you ace interviews, build your resume, and prepare for career transitions. Powered by Google Generative AI and Groq SDK, it provides personalized guidance and real-time feedback.

**Live Demo:** [career-prep-two.vercel.app](https://career-prep-two.vercel.app)

---

## ✨ Features

- **AI-Powered Interview Preparation**: Get personalized interview questions and feedback based on your industry and role
- **Resume Analysis**: Upload and optimize your resume with AI-driven suggestions
- **Career Roadmap**: Discover personalized career paths and skill requirements
- **Mock Interviews**: Practice with AI-generated interview scenarios
- **Real-time Analytics**: Track your progress with visual charts and insights
- **Google OAuth Integration**: Secure authentication and seamless login
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Markdown** - Render AI responses as formatted content
- **Recharts** - Beautiful data visualization
- **React PDF to Text** - Extract text from PDF resumes

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB** - NoSQL database with Mongoose ORM
- **Passport.js** - Authentication middleware
- **Google OAuth 2.0** - Secure user authentication

### AI/ML
- **Google Generative AI** - Advanced text generation
- **Groq SDK** - High-performance inference

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google OAuth 2.0 Credentials** - [Set up here](https://console.developers.google.com/)
- **Groq API Key** - [Get it here](https://console.groq.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/garvitbajajj/CareerPrep.git
cd CareerPrep
```

### 2. Install Dependencies

The frontend and the API server have separate dependency sets:

```bash
npm install
cd server && npm install && cd ..
```

### 3. Configure Environment Variables

Create `.env` in the project root, for the Vite frontend:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GROQ_API_KEY=your-groq-key     # see the security note below
```

And `server/.env`, for the API:

```env
MONGODB_URI=mongodb://localhost:27017/careerprep
SESSION_SECRET=a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 4. Run It

```bash
npm run dev                  # frontend on http://localhost:5173
cd server && npm start       # API on http://localhost:5000
```

Sign-in is Google OAuth only, so the Google credentials are required even
locally. Add `http://localhost:5000/api/auth/google/callback` as an
authorised redirect URI in the Google Cloud console.

---

## 🗂 Project Structure

```
src/
  components/      Interview, Resume, Chatbot, SkillsQuiz, QuestionBank,
                   Writing, Dashboard, ExportData, ErrorBoundary
  context/         AuthContext — session state shared across the app
  services/api.js  fetch wrapper; sends credentials with every call
server/
  app.js           Express app: session, Passport, Google OAuth, routes
  index.js         local entry point
  models/User.js   user, saved interviews, chats and scores
  routes/          auth.js (OAuth, session) and api.js (interview data)
api/index.js       Vercel serverless handler wrapping the Express app
```

Sessions are cookie-based and stored in MongoDB through `connect-mongo`, so
the API is stateless across serverless invocations.

---

## ⚠️ Security note on the Groq key

`VITE_GROQ_API_KEY` is read in the browser, and every Groq client is created
with `dangerouslyAllowBrowser: true`. **Vite inlines `VITE_` variables into
the JavaScript bundle at build time**, so a deployed build publishes the key
to anyone who opens developer tools.

Treat any key used this way as public: use a throwaway key with a spend limit,
and never point this at a key that bills you.

The fix is to move the Groq and Generative AI calls behind the Express server
— it already has sessions and a `requireAuth` guard — and have the components
call the API instead. Rotate the key when you do, since the old one has been
shipped.

---

## 🚢 Deployment

Deployed on Vercel. `vercel.json` serves the Vite build and routes `/api/*` to
`api/index.js`, which wraps the same Express app used locally. Set the server
environment variables in the Vercel project, and point `CLIENT_URL` and
`CALLBACK_URL` at the deployed domain rather than localhost.