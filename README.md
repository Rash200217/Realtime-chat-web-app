# Realtime Chat Web App

A robust, real-time chat application built with the MERN stack and uses Websocket API and Rest API (MongoDB, Express, React, Node.js) and Dockerized for easy deployment.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

![Image](https://github.com/user-attachments/assets/92970dba-2a9a-4922-9950-86cebe10a9ec)

![Image](https://github.com/user-attachments/assets/81762625-1652-40d1-bc33-50e19800f6cf)

![Image](https://github.com/user-attachments/assets/44732a17-6b89-49cc-ad96-936ab065bd84)

![Image](https://github.com/user-attachments/assets/94b2e168-aa4c-405a-910a-5e863b521b2d)

![Image](https://github.com/user-attachments/assets/a2244b20-6adf-421f-9fa9-622ccbcfe521)

![Image](https://github.com/user-attachments/assets/3cc24b90-0dbb-4858-b9ac-b1f282861f69)

![Image](https://github.com/user-attachments/assets/20d36897-3bee-4c0b-b986-90c444dfa10c)

Video Link: https://github.com/user-attachments/assets/5ae7b658-4a4b-4d43-a899-98c4ec73a407

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

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate a user and return a JWT.

### Users (`/api/users`)
- `GET /search`: Search for users by username or email. (Query param: `?query=...`)

### Chat (`/api/chat`)
- `GET /:userId`: Retrieve all chats for a specific user.
- `POST /`: Create a new 1-on-1 chat or retrieve an existing one.
- `GET /messages/:roomId`: specific chat messages

### Admin (`/api/admin`) - *Protected*
- `GET /stats`: View system statistics (users, messages, active chats).
- `GET /users`: List all users with pagination and search.
- `PUT /users/:id/ban`: Ban or unban a user.
- `GET /chats`: View recent chats.
- `DELETE /chats/:id`: Delete a chat and its messages.

## 📡 Socket.io Events

### Client Emits
- `user_connected`: Sent when a user logs in (sends `userId`).
- `join_room`: Joins a specific chat room.
- `typing`: Notifies that the user is typing (sends `{ room, ... }`).
- `stop_typing`: Notifies that typing has stopped.
- `send_message`: Sends a message object to the server.

### Server Emits
- `user_status`: Broadcasts online/offline status updates.
- `display_typing`: Tells other users in the room to show a typing indicator.
- `hide_typing`: Tells other users to hide the typing indicator.
- `receive_message`: Broadcasts the received message to the room.

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
