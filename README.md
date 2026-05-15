# MAD-ERP: Enterprise Intelligence & Industrial Elegance 🏗️

Welcome to **MAD-ERP** (Malik Art Decor Enterprise Resource Planning), a high-performance, full-stack ecosystem designed to revolutionize construction project management through **Financial Intelligence** and **Industrial Elegance**.

![MAD-ERP Banner](https://img.shields.io/badge/Enterprise-Ready-blue?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?style=for-the-badge&logo=render)

---

## 🌟 Core Pillars

### 1. Financial Intelligence 💰
A robust financial engine that tracks every rupee.
- **Vendor Ledgers**: Real-time tracking of outstanding balances, total payouts, and requisition history.
- **Requisition Settlement**: Automated workflows for material request approvals and financial clearance.
- **Project Profitability**: Analytical dashboards comparing site expenses against budgets.

### 2. Industrial Elegance UI 🎨
A state-of-the-art design system focused on "Bold Minimalism".
- **Glassmorphic Interface**: High-contrast OLED dark mode with frosted glass accents.
- **Smart Measurement Book (BOQ)**: High-density data grid for managing complex construction measurements.
- **Guided Tour System**: Interactive, tooltip-based onboarding to reduce training time.

### 3. Live Operations ⚡
- **Real-time Attendance**: Conflict detection and supervisor validation for labor management.
- **Critical Alerts**: Actionable notification panel for low inventory or pending approvals.
- **Multi-Role Access**: Tailored experiences for Admins, Supervisors, and Clients.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security (JWT), Hibernate/JPA |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion |
| **Data** | MySQL / PostgreSQL, Redis Caching, Flyway Migrations |
| **Deployment** | Render Blueprints, Docker Compose, Nginx |

---

## 📁 Project Structure

```text
mad-erp/
├── mad-backend/         # Spring Boot API Service
│   ├── src/main/java/   # Core logic (Controllers, Services, Models)
│   ├── src/main/resources/ # Configuration & DB Migrations
│   └── pom.xml          # Maven dependencies
├── mad-frontend/        # React Enterprise Dashboard
│   ├── src/components/  # Modular UI Components (Admin, UI, Shared)
│   ├── src/services/    # API Integration Layer
│   └── tailwind.config.js # Design System Tokens
├── render.yaml          # Render Cloud Deployment Blueprint
├── .env.example         # Root environment template
└── README.md            # You are here!
```

---

## 🚀 Getting Started

### 1. Local Development
```bash
# Clone and enter
git clone https://github.com/AzharuddinMalik/MAD-ERP.git
cd MAD-ERP

# Backend Setup
cd mad-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run

# Frontend Setup
cd ../mad-frontend
npm install
npm run dev
```

### 2. Deployment
This project is optimized for **Render**. Simply connect your repository to Render and use the **Blueprint** feature to automatically deploy the Backend, Frontend, and Database in one click.

---

## 🔒 Security & Compliance
- **JWT-Based Auth**: Secure, stateless session management.
- **Environment Isolation**: No sensitive keys are committed to the repository.
- **Audit Logging**: Every financial transaction and attendance update is logged for accountability.

## 👥 Contact & Support
Developed for **Malik Art Decor**. For technical support or feature requests, contact the system administrator.

---
*© 2024 Malik Art Decor. All rights reserved.*
