const http = require('http');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/user.model');
const Note = require('../src/models/note.model');
const Post = require('../src/models/post.model');

// Helper to make HTTP requests
function request({ port, method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('===========================================================');
  console.log('   SECURE NOTE-TAKING & POSTS REST API: COMPREHENSIVE TEST');
  console.log('===========================================================\n');

  // 1. Connect to MongoDB
  console.log(`[1] Connecting to MongoDB (${env.MONGODB_URI})...`);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: true });
  console.log(' -> Database connection successful.\n');

  // Clean existing test collections to ensure predictable test data
  console.log('[2] Resetting database collections for clean test execution...');
  await User.deleteMany({});
  await Note.deleteMany({});
  await Post.deleteMany({});
  console.log(' -> Collections cleared.\n');

  // 2. Start HTTP Test Server
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[3] Test HTTP Server running on http://127.0.0.1:${port}\n`);

  const results = [];
  const recordResult = (testName, passed, details = {}) => {
    results.push({ testName, passed, ...details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark}: ${testName}`);
    if (!passed) {
      console.error('   Details:', details);
    }
  };

  let aliceToken = null;
  let aliceId = null;
  let bobToken = null;
  let bobId = null;
  let adminToken = null;
  let adminId = null;
  let note1Id = null;
  let note2Id = null;
  let note3Id = null;
  let post1Id = null;
  let post2Id = null;
  let post3Id = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Health Check
    // -------------------------------------------------------------
    const resHealth = await request({ port, method: 'GET', path: '/api/v1/health' });
    recordResult('Health Check (GET /api/v1/health)', resHealth.statusCode === 200 && resHealth.body.status === 'UP', { resHealth });

    // -------------------------------------------------------------
    // TEST 2: Register User 1 (Alice)
    // -------------------------------------------------------------
    const resRegAlice = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'Password123!',
        role: 'User',
        interests: ['nodejs', 'ai', 'cloud']
      }
    });
    const regAlicePass = resRegAlice.statusCode === 201 && resRegAlice.body.data && resRegAlice.body.data.token;
    if (regAlicePass) {
      aliceToken = resRegAlice.body.data.token;
      aliceId = resRegAlice.body.data.user._id;
    }
    recordResult('Register User Alice (POST /api/v1/auth/register)', regAlicePass, { resRegAlice });

    // -------------------------------------------------------------
    // TEST 3: Register User 2 (Bob)
    // -------------------------------------------------------------
    const resRegBob = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'Password123!',
        role: 'User',
        interests: ['cloud', 'security', 'devops']
      }
    });
    const regBobPass = resRegBob.statusCode === 201 && resRegBob.body.data && resRegBob.body.data.token;
    if (regBobPass) {
      bobToken = resRegBob.body.data.token;
      bobId = resRegBob.body.data.user._id;
    }
    recordResult('Register User Bob (POST /api/v1/auth/register)', regBobPass, { resRegBob });

    // -------------------------------------------------------------
    // TEST 4: Register Admin (Carol)
    // -------------------------------------------------------------
    const resRegAdmin = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Carol Admin',
        email: 'carol.admin@example.com',
        password: 'AdminPassword123!',
        role: 'Admin',
        interests: ['ai', 'management']
      }
    });
    const regAdminPass = resRegAdmin.statusCode === 201 && resRegAdmin.body.data && resRegAdmin.body.data.token;
    if (regAdminPass) {
      adminToken = resRegAdmin.body.data.token;
      adminId = resRegAdmin.body.data.user._id;
    }
    recordResult('Register Admin Carol (POST /api/v1/auth/register)', regAdminPass, { resRegAdmin });

    // -------------------------------------------------------------
    // TEST 5: Duplicate Email Registration (Unique Index Check)
    // -------------------------------------------------------------
    const resDupReg = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Duplicate Alice',
        email: 'alice@example.com',
        password: 'AnotherPassword123!'
      }
    });
    recordResult('Duplicate Email Rejection (409 Conflict)', resDupReg.statusCode === 409, { resDupReg });

    // -------------------------------------------------------------
    // TEST 6: User Login
    // -------------------------------------------------------------
    const resLogin = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/login',
      body: {
        email: 'alice@example.com',
        password: 'Password123!'
      }
    });
    recordResult('User Login (POST /api/v1/auth/login)', resLogin.statusCode === 200 && resLogin.body.data && resLogin.body.data.token, { resLogin });

    // -------------------------------------------------------------
    // TEST 7: Invalid Login Credentials
    // -------------------------------------------------------------
    const resInvalidLogin = await request({
      port,
      method: 'POST',
      path: '/api/v1/auth/login',
      body: {
        email: 'alice@example.com',
        password: 'WrongPassword!'
      }
    });
    recordResult('Invalid Password Rejection (401 Unauthorized)', resInvalidLogin.statusCode === 401, { resInvalidLogin });

    // -------------------------------------------------------------
    // TEST 8: Get User Profile (GET /api/v1/users/profile)
    // -------------------------------------------------------------
    const resProfile = await request({
      port,
      method: 'GET',
      path: '/api/v1/users/profile',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    recordResult('Get User Profile (GET /api/v1/users/profile)', resProfile.statusCode === 200 && resProfile.body.data.email === 'alice@example.com', { resProfile });

    // -------------------------------------------------------------
    // TEST 9: Update User Profile (PUT /api/v1/users/profile)
    // -------------------------------------------------------------
    const resUpdateProfile = await request({
      port,
      method: 'PUT',
      path: '/api/v1/users/profile',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        name: 'Alice Johnson Updated',
        interests: ['nodejs', 'ai', 'cloud', 'mongodb']
      }
    });
    recordResult('Update User Profile (PUT /api/v1/users/profile)', resUpdateProfile.statusCode === 200 && resUpdateProfile.body.data.name === 'Alice Johnson Updated', { resUpdateProfile });

    // -------------------------------------------------------------
    // TEST 10: Create Notes for Alice
    // -------------------------------------------------------------
    const resNote1 = await request({
      port,
      method: 'POST',
      path: '/api/v1/notes',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'SOLID Principles in Express',
        content: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
        tags: ['architecture', 'javascript'],
        isPinned: true
      }
    });
    note1Id = resNote1.body.data?._id;

    const resNote2 = await request({
      port,
      method: 'POST',
      path: '/api/v1/notes',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'MongoDB Index Guidelines',
        content: 'Rely on default _id index. Explicit indexes only via schema.index(). Compound index for user notes.',
        tags: ['mongodb', 'database'],
        isPinned: false
      }
    });
    note2Id = resNote2.body.data?._id;

    const resNote3 = await request({
      port,
      method: 'POST',
      path: '/api/v1/notes',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'Temporary Scratch Note',
        content: 'This note will be updated and deleted during the test.',
        tags: ['temp'],
        isPinned: false
      }
    });
    note3Id = resNote3.body.data?._id;

    recordResult('Create Notes (POST /api/v1/notes)', resNote1.statusCode === 201 && resNote2.statusCode === 201 && resNote3.statusCode === 201);

    // -------------------------------------------------------------
    // TEST 11: Get User Paginated Notes
    // -------------------------------------------------------------
    const resGetNotes = await request({
      port,
      method: 'GET',
      path: '/api/v1/notes?page=1&limit=2',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const notesPaginationPass =
      resGetNotes.statusCode === 200 &&
      resGetNotes.body.pagination &&
      resGetNotes.body.pagination.total === 3 &&
      resGetNotes.body.pagination.totalPages === 2 &&
      resGetNotes.body.data.length === 2;
    recordResult('Paginated User Notes (GET /api/v1/notes?page=1&limit=2)', notesPaginationPass, { resGetNotes });

    // -------------------------------------------------------------
    // TEST 12: Search Notes by Keyword
    // -------------------------------------------------------------
    const resSearchNotes = await request({
      port,
      method: 'GET',
      path: '/api/v1/notes?search=Guidelines',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const searchNotesPass = resSearchNotes.statusCode === 200 && resSearchNotes.body.data.length === 1 && resSearchNotes.body.data[0]._id === note2Id;
    recordResult('Search Notes by Keyword (GET /api/v1/notes?search=Guidelines)', searchNotesPass, { resSearchNotes });

    // -------------------------------------------------------------
    // TEST 13: Get Single Note by ID (Built-in _id Awareness)
    // -------------------------------------------------------------
    const resGetNote = await request({
      port,
      method: 'GET',
      path: `/api/v1/notes/${note1Id}`,
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    recordResult('Get Single Note by _id (GET /api/v1/notes/:id)', resGetNote.statusCode === 200 && resGetNote.body.data._id === note1Id, { resGetNote });

    // -------------------------------------------------------------
    // TEST 14: Note Ownership Enforcement (Bob cannot view Alice's note)
    // -------------------------------------------------------------
    const resNoteForbidden = await request({
      port,
      method: 'GET',
      path: `/api/v1/notes/${note1Id}`,
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    recordResult('Note Ownership Protection (403 Forbidden)', resNoteForbidden.statusCode === 403, { resNoteForbidden });

    // -------------------------------------------------------------
    // TEST 15: Update Note
    // -------------------------------------------------------------
    const resUpdateNote = await request({
      port,
      method: 'PUT',
      path: `/api/v1/notes/${note3Id}`,
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'Temporary Scratch Note (Updated)',
        isPinned: true
      }
    });
    recordResult('Update Note (PUT /api/v1/notes/:id)', resUpdateNote.statusCode === 200 && resUpdateNote.body.data.title.includes('Updated'), { resUpdateNote });

    // -------------------------------------------------------------
    // TEST 16: Delete Note
    // -------------------------------------------------------------
    const resDeleteNote = await request({
      port,
      method: 'DELETE',
      path: `/api/v1/notes/${note3Id}`,
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    recordResult('Delete Note (DELETE /api/v1/notes/:id)', resDeleteNote.statusCode === 200, { resDeleteNote });

    // -------------------------------------------------------------
    // TEST 17: Create Posts (Published and Draft)
    // -------------------------------------------------------------
    const resPost1 = await request({
      port,
      method: 'POST',
      path: '/api/v1/posts',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'Building Layered Architecture with Express',
        body: 'A comprehensive guide to separating Controllers, Services, Repositories, and Models.',
        tags: ['express', 'solid', 'architecture'],
        status: 'published'
      }
    });
    post1Id = resPost1.body.data?._id;

    const resPost2 = await request({
      port,
      method: 'POST',
      path: '/api/v1/posts',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'MongoDB Aggregations Demystified',
        body: 'How to use $facet, $unwind, and $lookup for ultra-efficient database queries.',
        tags: ['mongodb', 'aggregation'],
        status: 'published'
      }
    });
    post2Id = resPost2.body.data?._id;

    const resPost3 = await request({
      port,
      method: 'POST',
      path: '/api/v1/posts',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: {
        title: 'Unpublished Draft: Microservices vs Monoliths',
        body: 'Work in progress draft content...',
        tags: ['draft'],
        status: 'draft'
      }
    });
    post3Id = resPost3.body.data?._id;

    // Bob creates a post too
    const resPostBob = await request({
      port,
      method: 'POST',
      path: '/api/v1/posts',
      headers: { Authorization: `Bearer ${bobToken}` },
      body: {
        title: 'Cloud Security Best Practices',
        body: 'Essential security considerations for cloud deployments.',
        tags: ['cloud', 'security'],
        status: 'published'
      }
    });

    recordResult('Create Posts (POST /api/v1/posts)', resPost1.statusCode === 201 && resPost2.statusCode === 201 && resPost3.statusCode === 201 && resPostBob.statusCode === 201);

    // -------------------------------------------------------------
    // TEST 18: Public Feed (Only Published Posts)
    // -------------------------------------------------------------
    const resFeed = await request({
      port,
      method: 'GET',
      path: '/api/v1/posts?page=1&limit=10'
    });
    const feedPass =
      resFeed.statusCode === 200 &&
      resFeed.body.pagination.total === 3 && // 2 from Alice + 1 from Bob, draft excluded!
      resFeed.body.data.every((p) => p.status === 'published');
    recordResult('Public Feed Filter (GET /api/v1/posts)', feedPass, { resFeed });

    // -------------------------------------------------------------
    // TEST 19: Author Posts (Includes Drafts)
    // -------------------------------------------------------------
    const resMyPosts = await request({
      port,
      method: 'GET',
      path: '/api/v1/posts/me/all?page=1&limit=10',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const myPostsPass = resMyPosts.statusCode === 200 && resMyPosts.body.pagination.total === 3; // Alice has 3 total
    recordResult("Author's Posts Feed (GET /api/v1/posts/me/all)", myPostsPass, { resMyPosts });

    // -------------------------------------------------------------
    // TEST 20: SCENARIO 1: Group Users by Interests (Single Aggregation with $facet)
    // -------------------------------------------------------------
    const resScenario1 = await request({
      port,
      method: 'GET',
      path: '/api/v1/users/by-interests?page=1&limit=10',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const scenario1Pass =
      resScenario1.statusCode === 200 &&
      Array.isArray(resScenario1.body.data) &&
      resScenario1.body.data.length > 0 &&
      resScenario1.body.pagination &&
      resScenario1.body.pagination.total > 0 &&
      resScenario1.body.data[0]._id !== undefined &&
      Array.isArray(resScenario1.body.data[0].users);
    recordResult('Scenario 1: Group Users by Interests (Single Aggregation)', scenario1Pass, {
      groupsFound: resScenario1.body.data?.length,
      topGroup: resScenario1.body.data?.[0]
    });

    // -------------------------------------------------------------
    // TEST 21: SCENARIO 2: User Posts via $lookup (Single Aggregation Pipeline)
    // -------------------------------------------------------------
    const resScenario2 = await request({
      port,
      method: 'GET',
      path: `/api/v1/users/${aliceId}/posts`,
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const scenario2Pass =
      resScenario2.statusCode === 200 &&
      resScenario2.body.data._id === aliceId &&
      Array.isArray(resScenario2.body.data.posts) &&
      resScenario2.body.data.posts.length === 3;
    recordResult('Scenario 2: User with Posts via $lookup (Single Pipeline)', scenario2Pass, {
      user: resScenario2.body.data?.name,
      postCount: resScenario2.body.data?.posts?.length
    });

    // -------------------------------------------------------------
    // TEST 22: RBAC Check (Regular user accessing Admin endpoint should get 403)
    // -------------------------------------------------------------
    const resAdminForbidden = await request({
      port,
      method: 'GET',
      path: '/api/v1/admin/users',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    recordResult('RBAC Guard: Regular User Denied Admin Access (403)', resAdminForbidden.statusCode === 403, { resAdminForbidden });

    // -------------------------------------------------------------
    // TEST 23: Admin User Listing (Admin Role)
    // -------------------------------------------------------------
    const resAdminUsers = await request({
      port,
      method: 'GET',
      path: '/api/v1/admin/users?page=1&limit=10',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUsersPass = resAdminUsers.statusCode === 200 && resAdminUsers.body.pagination.total === 3;
    recordResult('Admin Get All Users (GET /api/v1/admin/users)', adminUsersPass, { resAdminUsers });

    // -------------------------------------------------------------
    // TEST 24: Admin Notes Listing (with populated user info)
    // -------------------------------------------------------------
    const resAdminNotes = await request({
      port,
      method: 'GET',
      path: '/api/v1/admin/notes?page=1&limit=10',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminNotesPass =
      resAdminNotes.statusCode === 200 &&
      resAdminNotes.body.pagination.total === 2 && // 2 remaining after 1 deletion
      resAdminNotes.body.data[0].userId &&
      resAdminNotes.body.data[0].userId.email !== undefined;
    recordResult('Admin Get All Notes with Populated User (GET /api/v1/admin/notes)', adminNotesPass, { resAdminNotes });

    // -------------------------------------------------------------
    // TEST 25: Swagger Documentation Endpoints
    // -------------------------------------------------------------
    const resSwaggerJson = await request({ port, method: 'GET', path: '/api-docs.json' });
    const resSwaggerUI = await request({ port, method: 'GET', path: '/api-docs/' });
    const swaggerPass = resSwaggerJson.statusCode === 200 && resSwaggerJson.body.openapi === '3.0.0' && resSwaggerUI.statusCode === 200;
    recordResult('Swagger UI & OpenAPI Spec (/api-docs and /api-docs.json)', swaggerPass);

  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    // Check saved database contents count
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalPosts = await Post.countDocuments();

    console.log('\n===========================================================');
    console.log('              FINAL DATABASE STATE VERIFICATION');
    console.log('===========================================================');
    console.log(` -> Total Users Persisted in MongoDB: ${totalUsers}`);
    console.log(` -> Total Notes Persisted in MongoDB: ${totalNotes}`);
    console.log(` -> Total Posts Persisted in MongoDB: ${totalPosts}`);

    const sampleUsers = await User.find({}, { name: 1, email: 1, role: 1, interests: 1 });
    console.log('\nPersisted Users:', JSON.stringify(sampleUsers, null, 2));

    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    console.log('\n[Database & Server] Disconnected cleanly.');

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`\nTEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} tests.`);

    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});

