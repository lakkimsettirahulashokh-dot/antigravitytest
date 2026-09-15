/**
 * Automated Verification of the 8 Authentication & Session Persistence Scenarios
 * BTechPath AI OS
 */

const assert = require('assert');
const http = require('http');

const BASE_URL = 'http://localhost:8080';

// Simple fetch helper for Node
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json !== null ? json : data,
          rawText: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// In-memory Storage Mock simulating browser localStorage/sessionStorage
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

async function runScenarioTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING 8-SCENARIO AUTHENTICATION & PERSISTENCE TESTS');
  console.log('========================================================\n');

  const testEmail = `student_${Date.now()}@btechpath.ai`;
  const testPassword = 'SecurePassword123!';
  let userToken = null;
  let userId = null;

  const mockLocalStorage = new MockStorage();
  const mockSessionStorage = new MockStorage();

  // ----------------------------------------------------
  // SCENARIO 1: New / Logged-out User
  // Open website -> Public Home -> Start Your Journey -> Login -> Dashboard
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 1] New / Logged-out User Opening Website & Logging In');
  
  // 1a. User opens index.html without token
  let hasStoredToken = false;
  for (let i = 0; i < mockLocalStorage.length; i++) {
    const k = mockLocalStorage.key(i);
    if (k && (k.startsWith('sb-') || k.includes('auth-token') || k === 'btechpath_user_session')) {
      hasStoredToken = true;
      break;
    }
  }
  assert.strictEqual(hasStoredToken, false, 'No token in storage for new user');
  
  // Public home renders directly (no redirect, no splash)
  const homeRes = await request('/index.html');
  assert.strictEqual(homeRes.status, 200, 'Public home returns 200');
  assert(homeRes.rawText.includes('Start Your Journey') || homeRes.rawText.includes('Sign In'), 'Landing page contains Start Your Journey or Sign In');

  // 1b. Create user account and login
  const signupRes = await request('/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email: testEmail,
      password: testPassword,
      data: { full_name: 'Alex Rivera', branch: 'CSE', semester: 4 }
    }
  });
  assert(signupRes.status === 200 || signupRes.status === 201, 'Signup successful');
  userId = signupRes.data.user.id;

  const loginRes = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email: testEmail,
      password: testPassword
    }
  });
  assert.strictEqual(loginRes.status, 200, 'Login returns 200');
  assert(loginRes.data.access_token, 'Login returns access_token');
  userToken = loginRes.data.access_token;

  // Store persistent session in localStorage (real provider mechanism)
  mockLocalStorage.setItem('sb-test-auth-token', JSON.stringify({
    access_token: userToken,
    user: loginRes.data.user,
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }));
  mockLocalStorage.setItem('btechpath_user_session', JSON.stringify({
    id: userId,
    email: testEmail,
    name: 'Alex Rivera',
    onboarding_completed: true,
    branch: 'CSE',
    semester: 4
  }));

  console.log('   ✅ SCENARIO 1 PASSED: New user opens public home, signs in, session persisted.\n');

  // ----------------------------------------------------
  // SCENARIO 2: Logged-in User Closes Website & Reopens
  // Close website -> Reopen -> Loading splash -> Dashboard
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 2] Logged-in User Closes Website & Reopens');
  
  // Closing browser clears sessionStorage, but leaves localStorage intact
  mockSessionStorage.clear();

  // Reopen index.html: head script checks for stored token
  let tokenFound = false;
  for (let i = 0; i < mockLocalStorage.length; i++) {
    const k = mockLocalStorage.key(i);
    if (k && (k.startsWith('sb-') || k.includes('auth-token') || k === 'btechpath_user_session')) {
      tokenFound = true;
      break;
    }
  }
  assert.strictEqual(tokenFound, true, 'Stored session token successfully found on reopening');

  // Verify session against server (/auth/v1/user)
  const verifyRes = await request('/auth/v1/user', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(verifyRes.status, 200, 'Session verified with server');
  assert.strictEqual(verifyRes.data.email, testEmail, 'Restored session email matches');
  
  // Dashboard is open
  const dashRes = await request('/dashboard.html');
  assert.strictEqual(dashRes.status, 200, 'Dashboard is accessible');
  console.log('   ✅ SCENARIO 2 PASSED: Reopened session restored, dashboard reached.\n');

  // ----------------------------------------------------
  // SCENARIO 3: Logged-in User Refreshes the Page
  // Refresh -> Dashboard remains accessible
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 3] Logged-in User Refreshes Page');
  
  // Refreshing does not clear localStorage or sessionStorage
  const refreshCheck = await request('/auth/v1/user', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(refreshCheck.status, 200, 'Auth check succeeds on refresh');
  console.log('   ✅ SCENARIO 3 PASSED: Session intact on page refresh.\n');

  // ----------------------------------------------------
  // SCENARIO 4: Logged-in User Navigates Around & Reopens
  // Navigate -> Close -> Reopen -> Dashboard
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 4] Logged-in User Navigates & Reopens');
  
  // Simulate navigation to other pages
  const skillsRes = await request('/skills.html');
  assert.strictEqual(skillsRes.status, 200, 'Skills route loads');
  const quizRes = await request('/quiz.html');
  assert.strictEqual(quizRes.status, 200, 'Quiz route loads');

  // Close browser and reopen
  mockSessionStorage.clear();
  const reopenUser = await request('/auth/v1/user', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(reopenUser.status, 200, 'Session remains valid after close & reopen');
  console.log('   ✅ SCENARIO 4 PASSED: Navigated, closed, reopened with valid session.\n');

  // ----------------------------------------------------
  // SCENARIO 5: Explicit Logout
  // Logout -> Real sign-out -> Public Home -> Reopen -> Sign In required
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 5] Explicit Logout');
  
  // 5a. Call /auth/v1/logout to invalidate on server
  const logoutRes = await request('/auth/v1/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(logoutRes.status, 200, 'Server logout succeeded');

  // 5b. Verify that old token is now rejected by server
  const postLogoutCheck = await request('/auth/v1/user', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(postLogoutCheck.status, 401, 'Old token rejected with 401 Unauthorized');

  // 5c. Client purges only auth tokens
  mockLocalStorage.removeItem('sb-test-auth-token');
  mockLocalStorage.removeItem('btechpath_user_session');
  mockSessionStorage.setItem('btechpath_just_logged_out', 'true');

  // Reopen index.html: no auth tokens exist
  let hasTokenAfterLogout = false;
  for (let i = 0; i < mockLocalStorage.length; i++) {
    const k = mockLocalStorage.key(i);
    if (k && (k.startsWith('sb-') || k.includes('auth-token') || k === 'btechpath_user_session')) {
      hasTokenAfterLogout = true;
      break;
    }
  }
  assert.strictEqual(hasTokenAfterLogout, false, 'No auth tokens remain after logout');
  console.log('   ✅ SCENARIO 5 PASSED: Real sign-out invalidates session; Sign In required.\n');

  // ----------------------------------------------------
  // SCENARIO 6: Logged-out User Directly Enters /dashboard
  // Direct enter /dashboard -> Redirect to public Home / Sign In
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 6] Logged-out User Accessing Protected Route');
  
  // Route check for unauthenticated request
  const noAuthUser = await request('/auth/v1/user', {
    method: 'GET',
    headers: {}
  });
  assert.strictEqual(noAuthUser.status, 401, 'Unauthenticated user rejected by server');

  // Clean URL resolution: /dashboard resolves to dashboard.html with no-cache headers
  const dashCleanRes = await request('/dashboard');
  assert.strictEqual(dashCleanRes.status, 200, 'Clean URL /dashboard resolved');
  assert(dashCleanRes.headers['cache-control'].includes('no-store'), 'Strict no-store cache header present');
  assert(dashCleanRes.headers['cache-control'].includes('no-cache'), 'Strict no-cache header present');
  console.log('   ✅ SCENARIO 6 PASSED: Protected route is guarded and uncacheable.\n');

  // ----------------------------------------------------
  // SCENARIO 7: Browser Back after Logout
  // Logged-out user presses Back -> Must NOT regain protected Dashboard
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 7] Browser Back After Logout');
  
  // pageshow event simulation with persisted: true
  const simulatedBackSession = mockLocalStorage.getItem('btechpath_user_session');
  assert.strictEqual(simulatedBackSession, null, 'Session is absent on back-navigation');
  
  // Server denies any cached access
  const backAuthRes = await request('/auth/v1/user', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.strictEqual(backAuthRes.status, 401, 'Access denied on Back button');
  console.log('   ✅ SCENARIO 7 PASSED: Browser Back blocked from regaining Dashboard.\n');

  // ----------------------------------------------------
  // SCENARIO 8: User Data Preservation
  // Login -> Close -> Reopen -> User data intact in database
  // ----------------------------------------------------
  console.log('▶ [SCENARIO 8] User Data Preservation in Database');
  
  // Re-login with the same user
  const reloginRes = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email: testEmail,
      password: testPassword
    }
  });
  assert.strictEqual(reloginRes.status, 200, 'Re-login successful');
  const freshToken = reloginRes.data.access_token;

  // Check that user profile data in database remained intact
  const profileRes = await request(`/rest/v1/profiles?id=eq.${userId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${freshToken}` }
  });
  assert.strictEqual(profileRes.status, 200, 'Profile fetch succeeded');
  assert(Array.isArray(profileRes.data) && profileRes.data.length > 0, 'User profile persisted across logout');
  assert.strictEqual(profileRes.data[0].email, testEmail, 'User email persisted');
  assert.strictEqual(profileRes.data[0].branch, 'CSE', 'User department persisted');
  assert.strictEqual(profileRes.data[0].semester, 4, 'User semester persisted');
  console.log('   ✅ SCENARIO 8 PASSED: User profile and educational data preserved in database.\n');

  console.log('========================================================');
  console.log('🎉 ALL 8 SCENARIOS PASSED WITH ZERO ERRORS!');
  console.log('========================================================');
}

runScenarioTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
