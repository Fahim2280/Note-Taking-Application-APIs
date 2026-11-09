// Models
const User = require('./models/user.model');
const Note = require('./models/note.model');
const Post = require('./models/post.model');

// Repositories
const UserRepository = require('./repositories/user.repository');
const NoteRepository = require('./repositories/note.repository');
const PostRepository = require('./repositories/post.repository');

// Services
const HashService = require('./services/hash.service');
const TokenService = require('./services/token.service');
const AuthService = require('./services/auth.service');
const UserService = require('./services/user.service');
const NoteService = require('./services/note.service');
const PostService = require('./services/post.service');

// Middlewares
const createAuthMiddleware = require('./middlewares/auth.middleware');

// Controllers
const AuthController = require('./controllers/auth.controller');
const UserController = require('./controllers/user.controller');
const NoteController = require('./controllers/note.controller');
const PostController = require('./controllers/post.controller');

class Container {
  constructor() {
    // 1. Instantiate Repositories
    this.userRepository = new UserRepository(User);
    this.noteRepository = new NoteRepository(Note);
    this.postRepository = new PostRepository(Post);

    // 2. Instantiate Infrastructure Services
    this.hashService = new HashService();
    this.tokenService = new TokenService();

    // 3. Instantiate Domain Services
    this.authService = new AuthService(this.userRepository, this.hashService, this.tokenService);
    this.userService = new UserService(this.userRepository, this.hashService);
    this.noteService = new NoteService(this.noteRepository);
    this.postService = new PostService(this.postRepository);

    // 4. Instantiate Middlewares
    this.authMiddleware = createAuthMiddleware(this.tokenService, this.userRepository);

    // 5. Instantiate Controllers
    this.authController = new AuthController(this.authService);
    this.userController = new UserController(this.userService);
    this.noteController = new NoteController(this.noteService);
    this.postController = new PostController(this.postService);
  }
}

const container = new Container();

module.exports = container;

