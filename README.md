# Tars Chat 💬

Tars Chat is a real-time full-stack chat application built with **Next.js, Convex, and Clerk**.  
It supports live messaging, typing indicators, online presence tracking, and unread message management.

---

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS  
- **Backend:** Convex (real-time database & server functions)  
- **Authentication:** Clerk  
- **Deployment:** Vercel  

---

## ✨ Features

- 🔐 Secure authentication with Clerk  
- 💬 Real-time one-on-one messaging  
- 🟢 Online / Offline presence indicator  
- ⌨️ Live typing indicator  
- 📬 Unread message count per conversation  
- 📱 Fully responsive (mobile + desktop layout)  
- ⚡ Instant UI updates using Convex subscriptions  

---

## 🛠️ Getting Started (Local Setup)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/divik10/tars-chat-app.git
cd tars-chat-app

2️⃣ Install Dependencies
Bash
npm install
3️⃣ Setup Environment Variables
Create a .env.local file in the root directory and add your keys:

Code snippet
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=[https://your-deployment.convex.cloud](https://your-deployment.convex.cloud)
CONVEX_DEPLOYMENT=your-deployment-name
4️⃣ Run Development Server
Bash
npm run dev
Open http://localhost:3000 to view the app.

🌍 Live Demo
The application is live and deployed on Vercel:

👉 tars-chat-app-64wa.vercel.app

📖 Architecture Overview
🗄️ Database Schema (Convex)
users: Auth data and presence state (isOnline, lastSeen).

conversations: Participant lists and last message references.

messages: Chat content with sender and conversation IDs.

conversationMembers: Unread tracking, typing indicators, and lastReadAt timestamps.

🔄 Real-Time System
Powered by Convex subscriptions to ensure:

Instant Updates: Message lists refresh without page reloads.

Live Presence: Real-time online/offline status and typing indicators.

No Polling: Fully reactive data fetching for zero latency.

📱 UI Structure
DashboardPage: Orchestrates global layout and state.

ChatSidebar: User lists, active conversations, and unread badges.

ChatWindow: Message history, typing status, and composer.

Header: Navigation and Clerk user session management.

Built entirely with Tailwind CSS for a modern, responsive feel.

👨‍💻 Author
Divik Satija Electrical Engineering Student | Full-Stack Developer Stack: React • Next.js • TypeScript • Real-Time Systems

📌 Notes
This project is built for demonstration and learning purposes.

Authentication uses Clerk test keys for deployment preview environments.
