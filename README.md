# 🎓 JNTUH FastTrack v2

**JNTUH FastTrack** is a high-performance web application designed for JNTUH (Jawaharlal Nehru Technological University, Hyderabad) students to access their academic results instantly. It features a robust centralized results caching, and a beautiful analytics dashboard to track performance over time.

---

## 🌟 Key Features

- **🚀 Instant Result Search**: Fetch official results directly by Hall Ticket Number.
- **📊 Academic Analytics**: View SGPA/CGPA trends and semester-wise performance breakdowns.
- **📂 Secure Local Cache**: Results are encrypted and stored locally in `Results/jntuh_results.json` for lightning-fast subsequent access.
- **🔄 Auto-Sync**: Automatically aggregates official results into a comprehensive "Overall Performance" profile.
- **📈 Advanced Scraping**: Intelligent HTML parsing to handle JNTUH's result portal variations.
- **🤖 Cluster Expansion**: Proactively identifies neighboring hall ticket numbers to build a localized results database.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Modern design)
- **Visuals**: Lucide Icons, Recharts (for performance graphs)
- **State Management**: React Hooks & Context

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Scraping**: JSDOM, Node-Fetch
- **Security**: AES-256-CBC Encryption for stored data
- **Database**: File-based JSON storage (optimized with debounced writes)

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jntuh-fasttrack_v2
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=3001
   ENCRYPTION_KEY=
   JNTUH_HOME_URL=
   JNTUH_RESULT_ACTION_URL=
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and stay in the root directory:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:5173` (or the port shown in your terminal).

---

## 📁 Project Structure

```text
├── backend/
│   ├── Results/           # Encrypted local JSON database
│   ├── server.js          # Main Express server & scraper logic
│   ├── package.json
│   └── .gitignore
├── src/                   # React Frontend
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page layouts (Home, Dashboard, etc.)
│   ├── services/          # API integration logic
│   └── App.tsx            # Main application entry
├── index.html
├── package.json
└── README.md
```

---

## 🛡️ Data Privacy & Security
- All sensitive student data stored in `Results/jntuh_results.json` is **AES-256 encrypted**.
- The `.gitignore` files are configured to prevent sensitive `.env` files and the node_modules folder from being pushed to version control.

---

## 📝 License
This project is for educational purposes only. All data is fetched from the official JNTUH Results portal and Dhethi Api.
