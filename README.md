# Stockroom - Premium E-Commerce Application

**Stockroom** is a full-stack, production-ready e-commerce platform designed with modern aesthetics and premium user experiences in mind. Built for high performance, it seamlessly integrates advanced search filtering, dynamic categorization, and secure payment processing.

## 🚀 Key Features

*   **Beautiful UI/UX:** A stunning frontend built with React, Vite, and Tailwind CSS, featuring glassmorphism elements, dynamic hero carousels, and Flipkart/Amazon-style interactive category menus.
*   **Intelligent Search & Filtering:** A robust backend search engine that instantly queries across product names, descriptions, and brands. Clicking broad categories (like "Fashion" or "Electronics") intelligently fetches all related sub-category items.
*   **Secure Authentication:** Powered by Supabase, featuring secure Email/Password login, Google OAuth integration, and strict role-based access control (RBAC). 
*   **Dedicated Admin Dashboard:** A protected, powerful dashboard for administrators to view real-time revenue charts, total user metrics, and an advanced orders table.
*   **Flexible Payment Gateway:** Integrates with Razorpay for secure credit card/UPI transactions, alongside a custom-built "Cash on Delivery" bypass system for immediate local checkouts.
*   **Robust Database:** Powered by Prisma ORM and a Supabase PostgreSQL database.

## 🛠️ Technology Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Query, Zustand
*   **Backend:** Node.js, Express, TypeScript, Prisma ORM
*   **Database:** PostgreSQL (Hosted on Supabase)
*   **Payments:** Razorpay API
*   **Auth:** Supabase Auth / JWT
*   **Deployment:** Railway / GitHub

## 🌐 Quick Deployment (Railway)

This repository is pre-configured for Monorepo deployment on Railway.

1. Connect this repository to your Railway account.
2. Railway will automatically detect the `/frontend` and `/backend` directories.
3. Deploy both services.
4. Add the necessary Environment Variables (from `.env.example`) to each service.
5. The backend automatically runs `prisma generate && tsc` on build, and the frontend uses `serve -s dist`.

## 🔒 Security Notice

**Never upload `.env` files to this repository.** All sensitive keys (Supabase database passwords, Razorpay API keys) must be securely managed via the Railway Dashboard.

## 🧑‍💻 Local Setup

1. Copy `.env.example` to `.env` in both frontend and backend and fill in your keys.
2. Start PostgreSQL/Supabase database.
3. In `backend/`: `npm install && npx prisma db push && npm run dev`
4. In `frontend/`: `npm install && npm run dev`
