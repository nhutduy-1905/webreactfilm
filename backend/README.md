# Film Streaming Backend

Node.js + Express API server cho film streaming platform.

## Setup

\\\ash
npm install
cp .env.example .env
# Configure .env with MongoDB connection
npm run prisma:migrate
npm run dev
\\\

Server: http://localhost:3001
API Docs: http://localhost:3001/api-docs

## Routes

- \POST /api/auth/register\ - Register
- \POST /api/auth/login\ - Login
- \GET /api/movies\ - Get all movies
- \POST /api/movies\ - Create movie
- \PUT /api/movies/:id\ - Update movie
- \DELETE /api/movies/:id\ - Delete movie
- \GET /api/genres\ - Get genres
- \GET /api/favorites\ - Get favorites
- \POST /api/favorites/:movieId\ - Add favorite
- \DELETE /api/favorites/:movieId\ - Remove favorite
