# Secure Note-Taking & Posts REST API

A production-grade, modular, secure REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** following **SOLID principles** and a **Layered Architecture**.

---

## 1. Architectural Highlights & SOLID Principles

- **Single Responsibility Principle (SRP)**:
  - **Models**: Mongoose schema definitions and explicit `schema.index(...)` calls.
  - **Repositories**: Database access, queries, and aggregation pipelines. No HTTP logic.
  - **Services**: Business rules, ownership checks, password hashing, and token generation. Throws operational `AppError`.
  - **Controllers**: Parse HTTP requests (`req.body`, `req.params`, `req.query`, `req.user`), call services, return standard `ApiResponse`.
  - **Middlewares**: Cross-cutting concerns (JWT authentication, role authorization, validation, centralized error handling).
- **Open/Closed Principle (OCP)**:
  - Role-based authorization middleware `authorizeRoles(...roles)` accepts role parameters dynamically, allowing new roles to be supported without modifying middleware logic.
- **Liskov Substitution Principle (LSP)**:
  - `BaseRepository` provides standard CRUD methods (`findById`, `findOne`, `create`, `updateById`, `deleteById`, `count`) which specialized repositories (`UserRepository`, `NoteRepository`, `PostRepository`) inherit and extend consistently.
- **Interface Segregation Principle (ISP)**:
  - Granular routers divided strictly by domain: `auth.routes.js`, `user.routes.js`, `admin.routes.js`, `note.routes.js`, and `post.routes.js`.
- **Dependency Inversion Principle (DIP)**:
  - Constructor injection used across all layers. Wired together in `src/container.js` (Composition Root).

---

## 2. Strict Interview & Indexing Constraints

1. **No Unnecessary Indexes**:
   - Inline `unique: true` is strictly omitted from schema property definitions.
   - All custom indexes are explicitly declared via `schema.index(...)` at the bottom of model files:
     - **User**: `{ email: 1 }` (unique), `{ interests: 1 }`
     - **Note**: `{ userId: 1, createdAt: -1 }` (compound index for user notes)
     - **Post**: `{ authorId: 1, createdAt: -1 }` (for author queries & lookup), `{ status: 1, createdAt: -1 }` (for public feed)
2. **`_id` Index Awareness**:
   - Zero custom indexes on `_id`. All single-document queries rely on MongoDB's default unique B-tree index on `_id`.
3. **Mandatory Pagination**:
   - All list endpoints implement standardized pagination (`page`, `limit`, `skip`, `total`, `totalPages`).
4. **Scenario 1 Constraint (Group by Interests)**:
   - Uses **exactly one** `User.aggregate([...])` call.
   - Zero secondary queries and no `.countDocuments()`. Total count and pagination are computed within the single pipeline using `$facet`.
5. **Scenario 2 Constraint (User Posts via `$lookup`)**:
   - Retrieves all posts belonging to a specific user via a **single aggregation pipeline** with a `$lookup` stage.

---

## 3. Directory Structure

```text
├── .env.example
├── .env
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── server.js                      # DB connect & HTTP listener
    ├── app.js                         # Express app setup, CORS, routes, global error handler
    ├── container.js                   # Dependency Injection composition root
    ├── config/
    │   ├── env.js                     # Environment variable validation & exports
    │   └── db.js                      # Mongoose connection with autoIndex: true
    ├── utils/
    │   ├── AppError.js                # Custom operational error class
    │   ├── asyncHandler.js            # Controller wrapper to catch rejected promises
    │   ├── pagination.js              # Query parser & metadata formatter (page, limit, skip)
    │   └── apiResponse.js             # Standardized JSON response helper
    ├── middlewares/
    │   ├── auth.middleware.js         # JWT verification & dynamic authorizeRoles
    │   ├── validate.middleware.js     # Request payload validation middleware
    │   └── error.middleware.js        # Global centralized error handling middleware
    ├── models/
    │   ├── user.model.js              # User schema + explicit schema.index()
    │   ├── note.model.js              # Note schema + explicit schema.index()
    │   └── post.model.js              # Post schema + explicit schema.index()
    ├── repositories/
    │   ├── base.repository.js         # Base CRUD operations by _id (LSP)
    │   ├── user.repository.js         # User queries & Aggregations (Scenario 1 & Scenario 2)
    │   ├── note.repository.js         # Paginated note queries
    │   └── post.repository.js         # Paginated post & feed queries
    ├── services/
    │   ├── hash.service.js            # bcryptjs hashing and comparison
    │   ├── token.service.js           # JWT sign and verify
    │   ├── auth.service.js            # Register & Login business logic
    │   ├── user.service.js            # Profile, Aggregations, Admin operations
    │   ├── note.service.js            # Note CRUD + ownership checks
    │   └── post.service.js            # Post CRUD + public feed
    ├── controllers/
    │   ├── auth.controller.js         # Authentication endpoints
    │   ├── user.controller.js         # Profile, Scenario 1 & 2
    │   ├── note.controller.js         # Note operations
    │   └── post.controller.js         # Post operations
    └── routes/
        ├── index.js                   # API v1 master router
        ├── auth.routes.js             # /api/v1/auth
        ├── user.routes.js             # /api/v1/users
        ├── admin.routes.js            # /api/v1/admin
        ├── note.routes.js             # /api/v1/notes
        └── post.routes.js             # /api/v1/posts
```

---

## 4. Setup & Running

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or on a server

### Configuration
Update `.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/secure_notes_db?directConnection=true
JWT_SECRET=supersecretjwtkey_change_in_production_123456789!
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
```

### Install Dependencies
```bash
npm install
```

### Start Server
```bash
# Production mode
npm start

# Development mode (nodemon)
npm run dev
```

---

## 5. API Endpoints & Swagger Documentation

### Interactive Swagger UI
- **Swagger Documentation UI**: `http://localhost:5000/api-docs` (or `http://localhost:5000/api/v1/docs`)
- **Raw OpenAPI Spec**: `http://localhost:5000/api-docs.json`

### Health Check
- `GET /api/v1/health`

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new account (`name`, `email`, `password`, optional `interests`, `role`)
- `POST /api/v1/auth/login` — Login with `email` and `password`, returns JWT

### Users (`/api/v1/users`)
- `GET /api/v1/users/profile` — Get authenticated user's profile [Bearer Token]
- `PUT /api/v1/users/profile` — Update name or interests [Bearer Token]
- `GET /api/v1/users/by-interests?page=1&limit=10` — **Scenario 1**: Group users by interests with single aggregation & pagination [Bearer Token]
- `GET /api/v1/users/:id/posts` — **Scenario 2**: Retrieve user and their posts via single aggregation with `$lookup` [Bearer Token]

### Notes (`/api/v1/notes`)
- `POST /api/v1/notes` — Create note (`title`, `content`, optional `tags`, `isPinned`) [Bearer Token]
- `GET /api/v1/notes?page=1&limit=10&search=` — Paginated notes belonging to authenticated user [Bearer Token]
- `GET /api/v1/notes/:id` — Get note by ID (owner or Admin) [Bearer Token]
- `PUT /api/v1/notes/:id` — Update note (owner or Admin) [Bearer Token]
- `DELETE /api/v1/notes/:id` — Delete note (owner or Admin) [Bearer Token]

### Posts (`/api/v1/posts`)
- `GET /api/v1/posts?page=1&limit=10&tag=` — Public feed of published posts (Public)
- `GET /api/v1/posts/:id` — Get post by ID (Public)
- `POST /api/v1/posts` — Create post (`title`, `body`, optional `tags`, `status`) [Bearer Token]
- `GET /api/v1/posts/me/all?page=1&limit=10` — Author's posts [Bearer Token]
- `PUT /api/v1/posts/:id` — Update post (author or Admin) [Bearer Token]
- `DELETE /api/v1/posts/:id` — Delete post (author or Admin) [Bearer Token]

### Admin (`/api/v1/admin`)
- `GET /api/v1/admin/users?page=1&limit=10` — Paginated list of all users [Admin Role Required]
- `GET /api/v1/admin/users/:id` — Get user by ID [Admin Role Required]
- `DELETE /api/v1/admin/users/:id` — Delete user [Admin Role Required]
- `GET /api/v1/admin/notes?page=1&limit=10` — Paginated list of all notes with user details [Admin Role Required]

