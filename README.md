#  Film Streaming Platform - MERN Stack

Full-stack film streaming platform với backend Node.js + Express, MongoDB + Prisma, và frontend Next.js cho user và admin.

##  Project Structure

\\\
 backend/                  # Node.js + Express + Prisma
    routes/              # API routes
       auth.js         # Register, login
       movies.js       # Movie CRUD
       genres.js       # Genre management
       favorites.js    # Favorites
       users.js        # User profiles
    prisma/
       schema.prisma   # Database schema
    server.js           # Main server
    package.json

 web/                     # Next.js user app (Port 3000)
    pages/
       index.tsx       # Home
       auth.tsx        # Login/Register
       my-list.tsx     # Favorites
       browse/films.tsx # Movies
    styles/
    package.json

 admin/                   # Next.js admin panel (Port 3002)
    pages/
       index.tsx       # Dashboard
    styles/
    package.json

 docker-compose.yml
 README.md
\\\

##  Tech Stack

**Backend**
- Node.js 18+ + Express
- MongoDB + Prisma ORM
- JWT Authentication
- Swagger API Docs

**Frontend**
- Next.js 14
- React 18
- Tailwind CSS
- NextAuth.js

##  Quick Start

### 1. Backend (Port 3001)
\\\ash
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URL
npm run prisma:migrate
npm run dev
\\\

### 2. Web (Port 3000)
\\\ash
cd web
npm install
npm run dev
\\\

### 3. Admin (Port 3002)
\\\ash
cd admin
npm install
npm run dev
\\\

##  Database Schema

**User** - email, name, password, image, favorites
**Movie** - title, description, videoUrl, duration, rating, director, cast, genre
**Genre** - name, movies
**Favorite** - userId, movieId

##  API Endpoints

### Auth
- \POST /api/auth/register\
- \POST /api/auth/login\

### Movies
- \GET /api/movies\
- \GET /api/movies/:id\
- \POST /api/movies\ (Admin)
- \PUT /api/movies/:id\ (Admin)
- \DELETE /api/movies/:id\ (Admin)

### Genres
- \GET /api/genres\
- \POST /api/genres\

### Favorites
- \GET /api/favorites\
- \POST /api/favorites/:movieId\
- \DELETE /api/favorites/:movieId\

##  Docker Deployment

\\\ash
docker-compose up -d
\\\

Services:
- MongoDB: localhost:27017
- Backend: http://localhost:3001
- Web: http://localhost:3000
- Admin: http://localhost:3002

##  Features

 User authentication (JWT)
 Movie catalog management
 Favorites/watchlist
 Admin dashboard
 Responsive design
 API documentation (Swagger)
 MongoDB database
 Docker support

##  Environment Setup

**Backend .env**
\\\
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret
PORT=3001
NODE_ENV=development
\\\

**Web .env.local**
\\\
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
\\\

**Admin .env.local**
\\\
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\\\

##  Links

- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api-docs
- Web App: http://localhost:3000
- Admin: http://localhost:3002

---

**Version**: 1.0.0
**License**: ISC
