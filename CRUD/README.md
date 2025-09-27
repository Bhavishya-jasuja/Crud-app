# Contract Management System

A full-stack MERN application for managing client contracts.

## Features

- Create, Read, Update, and Delete contracts
- File attachment support
- Date validation
- Responsive design
- Clean UI with Tailwind CSS

## Tech Stack

- MongoDB
- Express.js
- React
- Node.js
- Tailwind CSS
- Vite

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Start the servers:

Backend:
```bash
cd server
node index.js
```

Frontend:
```bash
cd client
npm run dev
```

4. Open http://localhost:5173 in your browser

## Environment Setup

Make sure you have:
- Node.js installed
- MongoDB installed and running
- Git installed

## Project Structure

```
client/
  ├── src/
  │   ├── components/
  │   │   └── crud.jsx
  │   ├── App.jsx
  │   └── main.jsx
  └── package.json

server/
  ├── index.js
  ├── uploads/
  └── package.json
```