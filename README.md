# Whiteboard Backend

This is the backend server for the Whiteboard application. It provides APIs and real-time communication for collaborative whiteboard features.

## Features

- RESTful API for managing whiteboard data
- Real-time collaboration using WebSockets (e.g., Socket.io)
- User authentication and authorization
- Persistent storage (e.g., MongoDB, PostgreSQL)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Database (MongoDB/PostgreSQL) running

## Installation

```bash
git clone https://github.com/yourusername/whiteboard-backend.git
cd whiteboard-backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and update environment variables as needed.

## Running the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Documentation

API documentation is available at `/api-docs` if Swagger or similar is set up.

## Folder Structure

- `src/` - Source code
- `routes/` - API route definitions
- `controllers/` - Request handlers
- `models/` - Database models
- `sockets/` - WebSocket event handlers

## License

MIT
