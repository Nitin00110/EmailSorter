# 📧 MailDash (EmailSorter) - AI-Powered Full-Stack Email Client

MailDash is a modern, full-stack email client engineered to provide intelligent inbox management. Built with **Spring Boot** and **React**, it securely integrates directly with the Gmail API using OAuth2 and introduces premium features like hidden read-receipt tracking, recursive MIME-type payload parsing, and context-aware AI email generation.

## ✨ Key Engineering Features

* **Custom Read Receipts (The "Double Blue Tick"):** Engineered an internal tracking mechanism that bypasses standard ad-blockers. The backend injects a custom `X-EmailSorter-Tracking-Id` header into outgoing emails and intercepts it upon opening, instantly updating PostgreSQL state.
* **Recursive MIME-Type Parsing:** Modern emails are deeply nested structures. Developed a recursive Java parsing algorithm that traverses `multipart/mixed` and `multipart/alternative` payloads to accurately extract and Base64-decode hidden HTML, prioritizing it over plain text fallbacks.
* **Context-Aware AI Replies (Gemini):** Integrates Google's Gemini AI to generate "Smart Replies." The backend dynamically feeds the logged-in user's PostgreSQL profile data into the AI prompt to ensure generated responses are highly personalized and contextually accurate.
* **Seamless OAuth2 Auto-Provisioning:** Built a frictionless authentication flow using Spring Security. New users logging in via Google are seamlessly intercepted, and their PostgreSQL database profiles are auto-generated behind the scenes without breaking the React dashboard flow.
* **Secure Monorepo Architecture:** Implemented strict CORS policies and CSRF configurations to securely connect a Vite/React frontend to the Spring Boot REST API, protecting AI endpoints and ensuring session cookies are safely passed.

## 💻 Tech Stack

**Backend:**
* Java 17+
* Spring Boot (Web, Security, Data JPA, OAuth2 Client)
* PostgreSQL
* Google API Client Libraries (Gmail API)

**Frontend:**
* React 19 & TypeScript
* Vite
* Tailwind CSS & Shadcn/UI
* Lucide Icons

## 🚀 Getting Started

This project is fully containerized using Docker, eliminating the need to install Java, Node.js, or PostgreSQL locally.

### Prerequisites
* **Docker & Docker Compose** installed on your machine.
* A Google Cloud Project with the **Gmail API enabled** and **OAuth 2.0 Client Credentials** created.
* A **Gemini AI API Key** (from Google AI Studio).

### 1. Environment Variables Setup
We use a "Bring Your Own Key" (BYOK) approach to keep credentials secure.

1. Clone the repository and navigate to the root directory.
2. Locate the `.env.example` file in the root folder.
3. Duplicate this file and rename the copy to exactly `.env` (this file is git-ignored).
4. Open your new `.env` file and insert your API keys and Google OAuth credentials:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   clientId=your_google_oauth_client_id
   clientSecret=your_google_oauth_client_secret
   DB_NAME=emailsorter_db
   DB_USER=postgres
   DB_PASSWORD=local_dev_password_123