const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Secure Note-Taking & Posts REST API',
    version: '1.0.0',
    description:
      'Production-grade, modular, secure REST API built with Node.js, Express, and MongoDB (Mongoose) following SOLID principles and Layered Architecture.\n\n### Key Features:\n- **Explicit Indexes Only**: All custom indexes defined with `schema.index()`, zero redundant inline index declarations.\n- **_id Index Awareness**: Leverages default MongoDB B-tree index on `_id` for single-document queries.\n- **Mandatory Pagination**: Standardized pagination metadata (`page`, `limit`, `skip`, `total`, `totalPages`).\n- **Scenario 1**: Group users by interests with single aggregation query (`$facet` pagination).\n- **Scenario 2**: Retrieve user with all posts via single aggregation with `$lookup`.\n- **Security**: JWT Bearer authentication & dynamic RBAC (`Admin` vs `User`).',
    contact: {
      name: 'API Support'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '672ce81f4a9b2b0012345678' },
          name: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          role: { type: 'string', enum: ['User', 'Admin'], example: 'User' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['coding', 'ai', 'cloud']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Note: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '672ce81f4a9b2b0012345679' },
          title: { type: 'string', example: 'Meeting Notes' },
          content: { type: 'string', example: 'Discuss architecture and database indexing constraints.' },
          userId: { type: 'string', example: '672ce81f4a9b2b0012345678' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['architecture', 'meeting']
          },
          isPinned: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '672ce81f4a9b2b001234567a' },
          title: { type: 'string', example: 'Introduction to SOLID in Express' },
          body: { type: 'string', example: 'Understanding dependency inversion and layered architecture...' },
          authorId: { type: 'string', example: '672ce81f4a9b2b0012345678' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['nodejs', 'express', 'solid']
          },
          status: { type: 'string', enum: ['draft', 'published'], example: 'published' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          skip: { type: 'integer', example: 0 },
          total: { type: 'integer', example: 45 },
          totalPages: { type: 'integer', example: 5 }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', minLength: 6, example: 'securePassword123' },
          role: { type: 'string', enum: ['User', 'Admin'], default: 'User' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['coding', 'ai']
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', example: 'securePassword123' }
        }
      },
      CreateNoteRequest: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Weekly Review' },
          content: { type: 'string', example: 'Key accomplishments and next sprint deliverables.' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['work', 'sprint']
          },
          isPinned: { type: 'boolean', example: false }
        }
      },
      CreatePostRequest: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', example: 'Modern Backend Architecture' },
          body: { type: 'string', example: 'Deep dive into clean architecture in Node.js...' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'architecture']
          },
          status: { type: 'string', enum: ['draft', 'published'], default: 'published' }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Invalid request payload or resource not found' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            nullable: true
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API is running healthy'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully with JWT token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already registered' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful with JWT token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/users/profile': {
      get: {
        summary: "Get current authenticated user's profile",
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '401': { description: 'Unauthorized' }
        }
      },
      put: {
        summary: "Update current authenticated user's profile",
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alice Updated' },
                  interests: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['coding', 'machine-learning']
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/users/by-interests': {
      get: {
        summary: 'Scenario 1: Group users by interests with single aggregation call and pagination',
        description: 'Executes exactly ONE aggregation call using $unwind, $group, and $facet to return grouped users and pagination metadata without secondary count queries.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': {
            description: 'Users grouped by interests with pagination',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/users/{id}/posts': {
      get: {
        summary: 'Scenario 2: Retrieve user with all their posts via single aggregation with $lookup',
        description: 'Executes a single aggregation pipeline matching user _id and performing a $lookup from the posts collection.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Target User ObjectId (relies on built-in _id B-tree index)',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'User details with aggregated posts array',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '404': { description: 'User not found' }
        }
      }
    },
    '/notes': {
      get: {
        summary: "Get current user's paginated notes (sorted newest first, pinned on top)",
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Paginated user notes',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      },
      post: {
        summary: 'Create a new personal note',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Note created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/notes/{id}': {
      get: {
        summary: 'Get note by ID (owner or Admin)',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Note retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '403': { description: 'Forbidden: Note does not belong to you' },
          '404': { description: 'Note not found' }
        }
      },
      put: {
        summary: 'Update note by ID (owner or Admin)',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Note updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '403': { description: 'Forbidden' },
          '404': { description: 'Note not found' }
        }
      },
      delete: {
        summary: 'Delete note by ID (owner or Admin)',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Note deleted successfully' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Note not found' }
        }
      }
    },
    '/posts': {
      get: {
        summary: 'Get public feed of published posts (Public endpoint)',
        tags: ['Posts'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'tag', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Paginated public posts feed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      },
      post: {
        summary: 'Create a new post',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Post created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/posts/me/all': {
      get: {
        summary: "Get authenticated user's own posts (both draft and published)",
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': {
            description: 'Paginated author posts',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/posts/{id}': {
      get: {
        summary: 'Get post by ID (Public)',
        tags: ['Posts'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Post retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '404': { description: 'Post not found' }
        }
      },
      put: {
        summary: 'Update post by ID (author or Admin)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostRequest' }
            }
          }
        },
        responses: {
          '200': { description: 'Post updated successfully' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Post not found' }
        }
      },
      delete: {
        summary: 'Delete post by ID (author or Admin)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Post deleted successfully' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Post not found' }
        }
      }
    },
    '/admin/users': {
      get: {
        summary: 'Paginated list of all registered users (Admin only)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': {
            description: 'Paginated user list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '403': { description: 'Forbidden: Admin role required' }
        }
      }
    },
    '/admin/users/{id}': {
      get: {
        summary: 'Get user details by ID (Admin only)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'User retrieved successfully' },
          '403': { description: 'Forbidden: Admin role required' },
          '404': { description: 'User not found' }
        }
      },
      delete: {
        summary: 'Delete user by ID (Admin only)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'User deleted successfully' },
          '403': { description: 'Forbidden: Admin role required' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/admin/notes': {
      get: {
        summary: 'Paginated list of all notes across users with owner details (Admin only)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': {
            description: 'Paginated notes list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          },
          '403': { description: 'Forbidden: Admin role required' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;

