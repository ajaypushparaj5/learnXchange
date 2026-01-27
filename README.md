# 🌐 LearnXchange: Peer-to-Peer Knowledge Economy

**Empowering communities to teach, learn, and grow through a decentralized expertise exchange.**



## 💡 The Vision
**LearnXchange** democratizes education by breaking the traditional teacher-student hierarchy. It is a dual-sided marketplace designed for the **ALOKI 2.0 Hackathon**, allowing every user to act as both a mentor and a learner. By sharing knowledge, users earn virtual coins that can be reinvested into their own learning journey.

## 🚀 Key Features for ALOKI 2.0
* **Dual-Role Dashboard:** Seamlessly switch between "Teaching" and "Learning" modes within a single interface.
* **Live Exchange Hub:** Real-time scheduling of peer-to-peer sessions using **Supabase** relational mapping.
* **Proof-of-Progress:** A robust tracking system where mentors mark sessions complete, instantly updating the learner's progress bar.
* **Coin-Driven Growth:** A virtual economy where teaching earns you coins that can be used to unlock premium courses or official certifications.
* **Smart Scheduling:** Conflict-free session booking with automated meeting link generation.

## 🛠️ Technical Implementation
* **Frontend:** React.js with Tailwind CSS, utilizing a modern, dark-themed "Glassmorphism" UI.
* **Backend:** **Supabase** (PostgreSQL) for authentication and complex relational joins between mentors, learners, and courses.
* **State Management:** Context API for real-time coin balance and global session status.
* **Data Integrity:** Implemented "Safety-Fetch" logic and explicit Foreign Key constraints to ensure zero-error progress updates and prevent NaN math bugs.



## 🏗️ Architecture & Logic
The platform uses a sophisticated three-way link between `courses`, `enrollments`, and `course_sessions`. This ensures that:
1.  **Teachers** see who needs a class next and can manage their expertise via the Teacher Dashboard.
2.  **Learners** see their progress bars fill up in real-time as they attend sessions.
3.  **The System** maintains a single source of truth for every learning journey, preventing data mismatch during progress updates.



## 🔧 Installation & Setup
1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/your-username/learnxchange.git](https://github.com/your-username/learnxchange.git)
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file with your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🎯 Future Roadmap
* **AI-Matching:** Smart recommendations to pair teachers with learners based on skill gaps.
* **Reputation Scores:** Gamified ranking for top-rated mentors.
* **Community Forums:** Persistent discussion threads for every course to facilitate asynchronous learning.