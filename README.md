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

Follow these steps to run the application locally.

### Prerequisites
* Java 17+ installed
* Node.js & npm installed
* PostgreSQL running locally (default port `5432`)
* A Google Cloud Project with the **Gmail API enabled** and **OAuth 2.0 Client Credentials** created.
* A Gemini AI API Key.

### 1. Backend Setup (Spring Boot)
1. Open the project in your favorite IDE (IntelliJ, Eclipse, etc.).
2. Create or update your `src/main/resources/application.properties` file with your credentials:
   ```properties
   # PostgreSQL Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
   spring.datasource.username=your_postgres_username
   spring.datasource.password=your_postgres_password
   spring.jpa.hibernate.ddl-auto=update

   # Google OAuth2 Credentials
   spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
   
   # Required Scopes (Must include gmail.send to send emails!)
   spring.security.oauth2.client.registration.google.scope=openid,profile,email,[https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send](https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send)

   # Gemini AI API Key
   gemini.api.key=YOUR_GEMINI_API_KEY
