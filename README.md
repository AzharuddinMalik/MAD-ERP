# MAD-ERP: Malik Art Decor Management System

A comprehensive ERP system for managing construction projects, labor attendance, and site operations.

## 🚀 Features

- **Project Management**: Track multiple construction projects with real-time status updates
- **Labor Management**: Manage workers, attendance, and daily rates
- **Attendance Tracking**: Mark and validate worker attendance with conflict detection
- **Dashboard Analytics**: Real-time insights into projects, labor, and site updates
- **User Roles**: Admin, Supervisor, and Client access levels
- **Live Site Updates**: Photo uploads and progress tracking

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: JWT Authentication
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS
- **HTTP Client**: Axios
- **Routing**: React Router

### Deployment
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Recommended Platform**: Railway / DigitalOcean

## 📋 Prerequisites

- Docker Desktop installed
- Git installed
- (Optional) Node.js 20+ and Java 17+ for local development

## 🏃 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/mad-erp.git
cd mad-erp
```

### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
```

### 3. Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:3307

### 5. Default Login
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
mad-erp/
├── journalApp/          # Spring Boot Backend
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── mad-frontend/        # React Frontend
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml   # Container orchestration
├── .gitignore
└── README.md
```

## 🔧 Development

### Backend (Spring Boot)
```bash
cd journalApp
mvn spring-boot:run
```

### Frontend (React + Vite)
```bash
cd mad-frontend
npm install
npm run dev
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Railway (Recommended)
- DigitalOcean
- AWS / Azure / GCP

## 🔒 Security Notes

- Never commit `.env` files
- Change default admin password in production
- Use strong JWT secrets
- Enable HTTPS in production

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Malik Art Decor.

## 👥 Contact

For support or inquiries, contact the development team.
