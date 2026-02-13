# Realtime Chat Web App

A robust, real-time chat application built with the MERN stack and uses Websocket API and Rest API (MongoDB, Express, React, Node.js) and Dockerized for easy deployment.

## 🚀 Features

- **Real-time Messaging**: Instant communication powered by Socket.io.
- **User Authentication**: Secure sign-up and login with JWT.
- **Modern UI**: Clean and responsive interface using React and Tailwind CSS.
- **Docker Support**: Containerized client and server for consistent environments.
- **CI/CD Pipeline**: GitHub Actions workflow for automated Docker builds and pushes.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **DevOps**: Docker, Docker Compose, GitHub Actions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose
- [Node.js](https://nodejs.org/) (optional, for local development outside Docker)

## 🏁 Getting Started

### Quick Start with Docker (Recommended)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Rash200217/Realtime-chat-web-app.git
    cd Realtime-chat-web-app
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    This command will build the images and start the containers.

3.  **Access the application**:
    -   Frontend: `http://localhost:8080` (or `http://localhost:5173` depending on your setup)
    -   Backend API: `http://localhost:5000`

### Local Development (Without Docker)

**1. Server Setup:**
```bash
cd server
npm install
# Create a .env file with your variables (MONGO_URI, etc.)
npm run dev
```

**2. Client Setup:**
```bash
cd client
npm install
npm run dev
```

## ⚙️ Configuration

### Environment Variables
You should create a `.env` file in the `server` directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app # Or your MongoDB Atlas URI
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:8080
```

## 🔄 CI/CD Pipeline

This project includes a configured GitHub Actions workflow (`.github/workflows/docker-publish.yml`).

-   **Trigger**: Puts to `main` branch.
-   **Action**: Builds Docker images for `client` and `server` and pushes them to Docker Hub.
-   **Requirements**: You must add `DOCKER_USERNAME` and `DOCKER_PASSWORD` to your repository secrets.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

#Made by Rashmika Dhananjaya#
