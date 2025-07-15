# FitBuddy 🏋️‍♂️🥗 — Your AI-Powered Family Fitness & Nutrition Assistant

FitBuddy is a full-stack AI-driven platform that generates personalized 7-day fitness and meal plans for individuals and families. It adapts to dietary needs, allergens, fitness goals, and medical conditions, offering a smart and engaging user experience. FitBuddy includes support for multiple family members, intuitive dashboards, and will soon evolve to offer learning-based auto-adjustments based on user feedback.

---

## Features

- Authentication & Role Management (Google OAuth + manual signup)
- Manage multiple family members under one account
- Personalized health plans with diet type & allergen customization
- Visual analytics dashboard (diet, goals, medical stats)
- Save plan history by user and family member
- Upcoming: Feedback Loop + Smart Auto-Adaptation (weekly auto-scheduling)
- Upcoming: Role-Based Access for parents/trainers vs. members
- Upcoming: Export to PDF / Telegram / Email

---

## Tech Stack

Frontend:
- React.js + Tailwind CSS
- Firebase Authentication (Google OAuth)
- Recharts.js (Data Visualization)

Backend:
- Node.js + Express.js
- MongoDB (Mongoose)
- REST API Integration

AI/ML Logic:
- Gemini LLMs
- Custom NLP Pipelines

---

## Installation

1. **Clone the repository**:
   ```bash
    git clone https://github.com/your-username/Fitly.git
    cd Fitly
   ```

2. **Install frontend and backend dependencies** (recommended):
   ```bash
    # Frontend
    cd client
    npm install

    # Backend
    cd ../server
    npm install
   ```

3. **Create .env in /server**:
   ```bash
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_ai_key
    FIREBASE_API_KEY=your_firebase_key
   ```

4. **Run the development servers**:
   ```bash
    # Backend
    cd server
    npm run dev

    # Frontend
    cd ../client
    npm start
   ```

---

## License

[MIT License](LICENSE)