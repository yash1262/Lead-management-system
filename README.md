# Lead Management System

A full-stack lead management application built with React and Node.js.

## Features

- User authentication (login/register)
- Lead management (CRUD operations)
- Responsive design
- Real-time updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Quick Start

### Option 1: Using the startup script (Recommended)

1. Make sure you have MongoDB running locally on port 27017
2. Run the startup script:
   ```bash
   ./start-servers.sh
   ```

This will automatically start both the backend and frontend servers.

### Option 2: Manual startup

1. **Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the frontend server (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Test Credentials

- Email: `admin@test.com`
- Password: `password123`

## Troubleshooting

### Network Error on Login

If you encounter a "Network Error" on the login page:

1. **Check if both servers are running:**
   - Backend should be running on port 5000
   - Frontend should be running on port 3000

2. **Verify MongoDB is running:**
   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb
   # Or start MongoDB
   brew services start mongodb-community
   ```

3. **Check the browser console:**
   - Open Developer Tools (F12)
   - Look for any error messages in the Console tab

4. **Restart both servers:**
   ```bash
   # Kill existing processes
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   
   # Restart using the startup script
   ./start-servers.sh
   ```

### Common Issues

1. **Port already in use:**
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

2. **MongoDB connection issues:**
   - Ensure MongoDB is running locally
   - Check the connection string in `backend/.env`

3. **CORS issues:**
   - The backend is configured to allow requests from `http://localhost:3000`
   - Make sure the frontend is running on port 3000

## Project Structure

```
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── start-servers.sh
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## Environment Variables

The backend uses the following environment variables (configured in `backend/.env`):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm install
npm start  # Starts development server with hot reload
```

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set production environment variables
3. Start the backend server
4. Serve the frontend build files

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the backend server logs
3. Verify all prerequisites are installed
4. Ensure MongoDB is running
5. Try restarting both servers

## License

This project is for educational purposes.
