# Fitly 🏋️‍♂️🥗 

**AI-powered holistic wellness platform** for personalized fitness, nutrition, and mental health support.

---

## Features

### **Personalized Meal & Workout Plans**
- 7-day AI-generated plans (Gemini-powered)
- Customizable by diet type, allergens, medical conditions
- Smart workout distribution (3-7 days/week)
- Detailed meal descriptions with ingredients
- Family member management

### **Emotion-Aware Wellness Companion**
- Real-time emotion detection via NLP
- 50+ evidence-based wellness activities
- Interactive guided exercises (breathing, meditation, grounding)
- Personalized recommendations based on emotional state
- Privacy-first design

### **Analytics Dashboard**
- Health metrics visualization
- Plan history tracking
- Family health overview
- Quick wellness check-ins

---

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS + Framer Motion
- Firebase Auth (Google OAuth)
- Recharts.js

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- Google Gemini API
- Hugging Face Inference API
- Python
- 
---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance
- Google Gemini API key
- Firebase project (for auth)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Fitly

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### Environment Setup

Create `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_hf_api_key  # Optional
PORT=5000
```

Configure Firebase in `client/src/firebase.js`

### Run Development Servers

```bash
# Terminal 1: Backend
cd server
node server.js

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173`

---

## Project Structure

```
Fitly/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── context/         # Auth context
│   │   └── firebase.js      # Firebase config
│   └── package.json
│
├── server/                 # Express backend
│   ├── routes/             # API endpoints
│   ├── models/             # Mongoose schemas
│   ├── services/           # Business logic
│   │   ├── geminiService.js
│   │   └── emotionService.js
│   ├── data/               # Activity library
│   └── server.js           # Entry point
│
└── README.md
```

---

## API Endpoints

### Plans
- `POST /api/plan/generate` - Generate new plan
- `POST /api/plan/save` - Save plan
- `GET /api/plan/user/:userId` - Get user plans
- `GET /api/plan/stats/:userId` - Dashboard statistics

### Wellness
- `POST /api/wellness/analyze` - Analyze emotion from text
- `GET /api/wellness/activities` - Get all activities
- `GET /api/wellness/activities/:id` - Get specific activity
- `GET /api/wellness/categories` - Get categories

### Family
- `POST /api/family` - Add family member
- `GET /api/family/:userId` - Get family members
- `PUT /api/family/:id` - Update member
- `DELETE /api/family/:id` - Delete member

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

---

## Key Features Explained

### **Plan Generation**
- Input: Family members, diet preferences, workout days, medical conditions
- Process: Gemini AI generates personalized 7-day plan
- Output: Structured JSON with meals, workouts, macros

### **Wellness Companion**
- Emotion detection via Hugging Face API (fallback to rule-based)
- 50+ activities across 8 categories
- Interactive players for breathing, meditation, grounding
- Context-aware recommendations

### **Family Management**
- Multi-member support under one account
- Individual health tracking
- Shared and personal plans

---

## Design Philosophy

- **Minimalistic**: Clean, uncluttered UI
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Animations**: Framer Motion transitions
- **Responsive**: Mobile-first design
- **Accessible**: WCAG-compliant components

---

## Development

```bash
# Backend dev (with nodemon)
cd server
npm install -g nodemon
nodemon server.js

# Frontend dev
cd client
npm run dev

# Build for production
cd client
npm run build
```

---

## License

[MIT License](LICENSE)
